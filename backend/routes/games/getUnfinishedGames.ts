import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, expireStaleGames, getExpiresAt, getUserId, lastPlayedExpr, throwError } from '@backend/utils'
import { ONGOING_GAME_TTL_DAYS } from '@backend/utils/ongoingGames'

const GAMES_PER_PAGE = 20

const getUnfinishedGames = async (req: NextApiRequest, res: NextApiResponse) => {
  const page = req.query.page ? Number(req.query.page) : 0
  const userId = await getUserId(req, res)

  if (!userId) {
    return throwError(res, 401, 'Log in to see your ongoing games')
  }

  // expiry is applied here too, so it holds even if the cleanup job never runs
  await expireStaleGames(userId)

  const query = { userId: new ObjectId(userId), state: 'started' }

  const games = await collections.games
    ?.aggregate([
      { $match: query },
      { $addFields: { lastPlayed: lastPlayedExpr, guessCount: { $size: { $ifNull: ['$guesses', []] } } } },
      { $sort: { lastPlayed: -1, _id: -1 } },
      { $skip: page * GAMES_PER_PAGE },
      { $limit: GAMES_PER_PAGE + 1 },
      { $lookup: { from: 'maps', localField: 'mapId', foreignField: '_id', as: 'map' } },
      { $lookup: { from: 'challenges', localField: 'challengeId', foreignField: '_id', as: 'challenge' } },
      {
        $lookup: {
          from: 'users',
          localField: 'challenge.creatorId',
          foreignField: '_id',
          as: 'challengeCreator',
        },
      },
      {
        $project: {
          mode: 1,
          mapId: 1,
          challengeId: 1,
          isDailyChallenge: 1,
          gameSettings: 1,
          round: 1,
          totalPoints: 1,
          streak: 1,
          guessCount: 1,
          createdAt: 1,
          lastPlayedAt: '$lastPlayed',
          mapName: { $ifNull: [{ $arrayElemAt: ['$map.name', 0] }, '$mapName'] },
          mapPreviewImg: { $arrayElemAt: ['$map.previewImg', 0] },
          challengeCreatorId: { $arrayElemAt: ['$challengeCreator._id', 0] },
          challengeCreatorName: { $arrayElemAt: ['$challengeCreator.name', 0] },
        },
      },
    ])
    .toArray()

  if (!games) {
    return throwError(res, 400, 'There was a problem fetching your ongoing games')
  }

  const [total, notStarted] = await Promise.all([
    collections.games?.countDocuments(query),
    // games with no guesses yet, that "clear unstarted games" removes (challenges are left alone)
    collections.games?.countDocuments({ ...query, challengeId: null, guesses: { $size: 0 } }),
  ])

  const data = games.slice(0, GAMES_PER_PAGE).map((game) => ({ ...game, expiresAt: getExpiresAt(game) }))

  res.status(200).send({
    data,
    hasMore: games.length > GAMES_PER_PAGE,
    total: total ?? 0,
    notStartedCount: notStarted ?? 0,
    ttlDays: ONGOING_GAME_TTL_DAYS,
  })
}

export default getUnfinishedGames
