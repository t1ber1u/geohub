import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, getUserId, throwError } from '@backend/utils'
import { MapRankingsType, RankingsEntry, RankingsPeriod, RankingsRecords, RankingsRules } from '@types'

const TOP_ENTRIES = 10
const PERFECT_ROUND_POINTS = 5000
const PERIODS: RankingsPeriod[] = ['today', 'week', 'all']
const RULES: RankingsRules[] = ['moving', 'nomove', 'nmpz']

const RULES_QUERY: Record<RankingsRules, object> = {
  moving: { 'gameSettings.canMove': { $ne: false } },
  nomove: {
    'gameSettings.canMove': false,
    $or: [{ 'gameSettings.canPan': { $ne: false } }, { 'gameSettings.canZoom': { $ne: false } }],
  },
  nmpz: { 'gameSettings.canMove': false, 'gameSettings.canPan': false, 'gameSettings.canZoom': false },
}

// Periods reset at 00:00 UTC (weeks on Monday), the same clock the daily challenge uses
const getPeriodStart = (period: RankingsPeriod) => {
  if (period === 'all') return null

  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)

  if (period === 'week') {
    const daysSinceMonday = (start.getUTCDay() + 6) % 7
    start.setUTCDate(start.getUTCDate() - daysSinceMonday)
  }

  return start
}

let indexReady: Promise<string> | undefined

const getUsers = async (userIds: ObjectId[]) => {
  const users = await collections.users
    ?.find({ _id: { $in: userIds } }, { projection: { name: 1, avatar: 1 } })
    .toArray()

  return new Map((users || []).map((user) => [user._id.toString(), user]))
}

const getMapRankings = async (req: NextApiRequest, res: NextApiResponse) => {
  const mapId = req.query.mapId as string
  const period = (req.query.period as RankingsPeriod) || 'all'
  const rules = (req.query.rules as RankingsRules) || 'moving'

  if (!ObjectId.isValid(mapId) || !PERIODS.includes(period) || !RULES.includes(rules)) {
    return throwError(res, 400, 'Invalid leaderboard request')
  }

  indexReady ??= collections.games!.createIndex({ mapId: 1, state: 1, mode: 1, createdAt: -1 })
  await indexReady

  const userId = await getUserId(req, res)
  const periodStart = getPeriodStart(period)

  const gamesQuery = {
    mapId: new ObjectId(mapId),
    mode: 'standard',
    state: 'finished',
    notForLeaderboard: { $ne: true },
    // the daily challenge is played on the World map but has its own leaderboard
    isDailyChallenge: { $ne: true },
    ...RULES_QUERY[rules],
    ...(periodStart && { createdAt: { $gte: periodStart } }),
  }

  // Each player's best game: most points, then fastest
  const bestGames = (await collections.games
    ?.aggregate([
      { $match: gamesQuery },
      { $sort: { totalPoints: -1, totalTime: 1, createdAt: 1 } },
      {
        $group: {
          _id: '$userId',
          gameId: { $first: '$_id' },
          totalPoints: { $first: '$totalPoints' },
          totalTime: { $first: '$totalTime' },
          timeLimit: { $first: '$gameSettings.timeLimit' },
          achievedAt: { $first: '$createdAt' },
          perfectRounds: {
            $first: {
              $size: { $filter: { input: '$guesses', cond: { $gte: ['$$this.points', PERFECT_ROUND_POINTS] } } },
            },
          },
          gamesPlayed: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1, totalTime: 1 } },
    ])
    .toArray()) as any[]

  // Standard competition ranking: equal points and time share a rank
  const ranked = bestGames.map((game, idx) => ({ game, rank: idx + 1 }))
  ranked.forEach((row, idx) => {
    const prev = ranked[idx - 1]
    if (prev && prev.game.totalPoints === row.game.totalPoints && prev.game.totalTime === row.game.totalTime) {
      row.rank = prev.rank
    }
  })

  const myIndex = userId ? ranked.findIndex(({ game }) => game._id.toString() === userId.toString()) : -1
  const myRow = myIndex !== -1 ? ranked[myIndex] : null
  const nextRow = myRow ? ranked.slice(0, myIndex).reverse().find((row) => row.rank < myRow.rank) : undefined

  const records = await getRecords(gamesQuery)

  const playerIds = [
    ...ranked.slice(0, TOP_ENTRIES).map(({ game }) => game._id),
    ...[myRow?.game._id, nextRow?.game._id],
    ...[records.closestGuess?.userId, records.fastestPerfect?.userId, records.mostPerfect?.userId],
  ].filter(Boolean)
  const users = await getUsers(playerIds)

  const withUser = <T extends { userId: ObjectId }>(row: T) => {
    const user = users.get(row.userId.toString())
    return { ...row, userName: user?.name ?? 'Unknown player', userAvatar: user?.avatar }
  }

  const toEntry = ({ game, rank }: typeof ranked[number]): RankingsEntry =>
    withUser({
      rank,
      userId: game._id,
      gameId: game.gameId,
      totalPoints: game.totalPoints,
      totalTime: game.totalTime,
      perfectRounds: game.perfectRounds,
      gamesPlayed: game.gamesPlayed,
      timeLimit: game.timeLimit || 0,
      achievedAt: game.achievedAt,
    })

  const result: MapRankingsType = {
    period,
    rules,
    totalPlayers: ranked.length,
    entries: ranked.slice(0, TOP_ENTRIES).map(toEntry),
    me: myRow
      ? {
          ...toEntry(myRow),
          topPercent: Math.max(1, Math.ceil((myRow.rank / ranked.length) * 100)),
          next: nextRow
            ? {
                rank: nextRow.rank,
                userName: users.get(nextRow.game._id.toString())?.name ?? 'Unknown player',
                pointsBehind: nextRow.game.totalPoints - myRow.game.totalPoints,
              }
            : null,
        }
      : null,
    records: {
      closestGuess: records.closestGuess && withUser(records.closestGuess),
      fastestPerfect: records.fastestPerfect && withUser(records.fastestPerfect),
      mostPerfect: records.mostPerfect && withUser(records.mostPerfect),
    } as RankingsRecords,
  }

  res.status(200).send(result)
}

// Round-level records across the same games the leaderboard ranks
const getRecords = async (gamesQuery: object) => {
  const [records] = (await collections.games
    ?.aggregate([
      { $match: gamesQuery },
      { $unwind: '$guesses' },
      // rounds that timed out without a pin have no real guess
      { $match: { $or: [{ 'guesses.timedOut': { $ne: true } }, { 'guesses.timedOutWithGuess': true }] } },
      {
        $facet: {
          closestGuess: [
            { $sort: { 'guesses.distance.metric': 1, createdAt: 1 } },
            { $limit: 1 },
            { $project: { _id: 0, userId: 1, gameId: '$_id', distance: '$guesses.distance' } },
          ],
          fastestPerfect: [
            { $match: { 'guesses.points': { $gte: PERFECT_ROUND_POINTS } } },
            { $sort: { 'guesses.time': 1, createdAt: 1 } },
            { $limit: 1 },
            { $project: { _id: 0, userId: 1, gameId: '$_id', time: '$guesses.time' } },
          ],
          mostPerfect: [
            { $match: { 'guesses.points': { $gte: PERFECT_ROUND_POINTS } } },
            { $group: { _id: '$userId', count: { $sum: 1 }, firstAt: { $min: '$createdAt' } } },
            { $sort: { count: -1, firstAt: 1 } },
            { $limit: 1 },
            { $project: { _id: 0, userId: '$_id', count: 1 } },
          ],
        },
      },
    ])
    .toArray()) as any[]

  return {
    closestGuess: records?.closestGuess[0] ?? null,
    fastestPerfect: records?.fastestPerfect[0] ?? null,
    mostPerfect: records?.mostPerfect[0] ?? null,
  }
}

export default getMapRankings
