import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, getUserId, throwError } from '@backend/utils'
import {
  MapRankingsType,
  RankingsAttempt,
  RankingsEntry,
  RankingsPeriod,
  RankingsRecords,
  RankingsRules,
} from '@types'

const TOP_ENTRIES = 10
const PERFECT_ROUND_POINTS = 5000
const MAX_POINTS = 25000
const DISTRIBUTION_BIN = 1000
const DAY_MS = 24 * 60 * 60 * 1000
const PERIODS: RankingsPeriod[] = ['today', 'week', 'all']
const RULES: RankingsRules[] = ['moving', 'nomove', 'nmpz']
const ATTEMPTS: RankingsAttempt[] = ['best', 'first']

const RULES_QUERY: Record<RankingsRules, object> = {
  moving: { 'gameSettings.canMove': { $ne: false } },
  nomove: {
    'gameSettings.canMove': false,
    $or: [{ 'gameSettings.canPan': { $ne: false } }, { 'gameSettings.canZoom': { $ne: false } }],
  },
  nmpz: { 'gameSettings.canMove': false, 'gameSettings.canPan': false, 'gameSettings.canZoom': false },
}

type TimeWindow = { from: Date; to?: Date } | null

// Periods reset at 00:00 UTC (weeks on Monday), the same clock the daily challenge uses.
// Also returns the previous window, whose winner is the current champion.
const getPeriodWindows = (period: RankingsPeriod): { current: TimeWindow; previous: TimeWindow } => {
  if (period === 'all') return { current: null, previous: null }

  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)

  if (period === 'week') {
    const daysSinceMonday = (start.getUTCDay() + 6) % 7
    start.setUTCDate(start.getUTCDate() - daysSinceMonday)
  }

  const length = period === 'week' ? 7 * DAY_MS : DAY_MS

  return { current: { from: start }, previous: { from: new Date(start.getTime() - length), to: start } }
}

// Pipeline stages producing the games that compete on this board
const competingGames = (mapId: ObjectId, rules: RankingsRules, attempt: RankingsAttempt, window: TimeWindow) => {
  const mapGames = {
    mapId,
    mode: 'standard',
    notForLeaderboard: { $ne: true },
    // the daily challenge is played on the World map but has its own leaderboard
    isDailyChallenge: { $ne: true },
  }
  const boardFilter = {
    state: 'finished',
    ...RULES_QUERY[rules],
    ...(window && { createdAt: { $gte: window.from, ...(window.to && { $lt: window.to }) } }),
  }

  if (attempt === 'best') {
    return [{ $match: { ...mapGames, ...boardFilter } }]
  }

  // A player's first game on the map, finished or not: abandoning a game to peek at the locations
  // and starting over doesn't give a second first attempt
  return [
    { $match: mapGames },
    { $sort: { createdAt: 1 } },
    { $group: { _id: '$userId', game: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$game' } },
    { $match: boardFilter },
  ]
}

// Each player's best competing game (most points, then fastest), ranked
const rankPlayers = async (stages: object[]) => {
  const bestGames = (await collections.games
    ?.aggregate(
      [
        ...stages,
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
        // equal scores and times: whoever got there first is listed first
        { $sort: { totalPoints: -1, totalTime: 1, achievedAt: 1, _id: 1 } },
      ],
      { allowDiskUse: true }
    )
    .toArray()) as any[]

  // Standard competition ranking: equal points and time share a rank
  const ranked = bestGames.map((game, idx) => ({ game, rank: idx + 1 }))
  ranked.forEach((row, idx) => {
    const prev = ranked[idx - 1]
    if (prev && prev.game.totalPoints === row.game.totalPoints && prev.game.totalTime === row.game.totalTime) {
      row.rank = prev.rank
    }
  })

  return ranked
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
  const attempt = (req.query.attempt as RankingsAttempt) || 'best'

  if (!ObjectId.isValid(mapId) || !PERIODS.includes(period) || !RULES.includes(rules) || !ATTEMPTS.includes(attempt)) {
    return throwError(res, 400, 'Invalid leaderboard request')
  }

  indexReady ??= collections.games!.createIndex({ mapId: 1, state: 1, mode: 1, createdAt: -1 })
  await indexReady

  const userId = await getUserId(req, res)
  const mapObjectId = new ObjectId(mapId)
  const windows = getPeriodWindows(period)
  const stages = competingGames(mapObjectId, rules, attempt, windows.current)

  const [ranked, records, previousRanked] = await Promise.all([
    rankPlayers(stages),
    getRecords(stages),
    windows.previous ? rankPlayers(competingGames(mapObjectId, rules, attempt, windows.previous)) : [],
  ])

  const myIndex = userId ? ranked.findIndex(({ game }) => game._id.toString() === userId.toString()) : -1
  const myRow = myIndex !== -1 ? ranked[myIndex] : null
  const nextRow = myRow ? ranked.slice(0, myIndex).reverse().find((row) => row.rank < myRow.rank) : undefined
  const championRow = previousRanked[0]

  const playerIds = [
    ...ranked.slice(0, TOP_ENTRIES).map(({ game }) => game._id),
    ...[myRow?.game._id, nextRow?.game._id, championRow?.game._id],
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
    attempt,
    totalPlayers: ranked.length,
    champion: championRow ? withUser({ userId: championRow.game._id, totalPoints: championRow.game.totalPoints }) : null,
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
    distribution: getDistribution(ranked.map(({ game }) => game.totalPoints)),
    records: {
      closestGuess: records.closestGuess && withUser(records.closestGuess),
      fastestPerfect: records.fastestPerfect && withUser(records.fastestPerfect),
      mostPerfect: records.mostPerfect && withUser(records.mostPerfect),
    } as RankingsRecords,
  }

  res.status(200).send(result)
}

const getDistribution = (scores: number[]) => {
  const counts = new Array(MAX_POINTS / DISTRIBUTION_BIN).fill(0)
  scores.forEach((score) => counts[Math.min(counts.length - 1, Math.floor(score / DISTRIBUTION_BIN))]++)

  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0

  return { binSize: DISTRIBUTION_BIN, counts, average }
}

// Round-level records across the same games the leaderboard ranks
const getRecords = async (stages: object[]) => {
  const [records] = (await collections.games
    ?.aggregate(
      [
        ...stages,
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
      ],
      { allowDiskUse: true }
    )
    .toArray()) as any[]

  return {
    closestGuess: records?.closestGuess[0] ?? null,
    fastestPerfect: records?.fastestPerfect[0] ?? null,
    mostPerfect: records?.mostPerfect[0] ?? null,
  }
}

export default getMapRankings
