import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { abandonGames, collections, getUserId, throwError } from '@backend/utils'

const deleteGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const gameId = req.query.id as string

  if (!ObjectId.isValid(gameId)) {
    return throwError(res, 404, 'The game you are trying to delete could not be found')
  }

  const game = await collections.games?.findOne({ _id: new ObjectId(gameId) })

  if (!game) {
    return throwError(res, 404, 'The game you are trying to delete could not be found')
  }

  if (userId !== game.userId.toString()) {
    return throwError(res, 401, 'You are not authorized to delete this game')
  }

  // A challenge game is deleted outright, as before. Any other unfinished game is taken off the list but its
  // record kept, so it still counts as the player's first attempt on the map (see abandonGames).
  if (game.challengeId || game.state !== 'started') {
    const deletedGame = await collections.games?.deleteOne({ _id: game._id })

    if (!deletedGame) {
      return throwError(res, 400, 'An error occured while deleting the game')
    }
  } else {
    await abandonGames({ _id: game._id }, 'removed')
  }

  res.status(200).send({ message: 'Game removed' })
}

export default deleteGame
