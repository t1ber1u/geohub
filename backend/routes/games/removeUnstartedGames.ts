import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { abandonGames, getUserId, throwError } from '@backend/utils'

// Clears games the player opened but never made a guess in (challenge games are left alone)
const removeUnstartedGames = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)

  if (!userId) {
    return throwError(res, 401, 'Unauthorized')
  }

  const removed = await abandonGames(
    { userId: new ObjectId(userId), challengeId: null, guesses: { $size: 0 } },
    'removed',
  )

  res.status(200).send({ removed })
}

export default removeUnstartedGames
