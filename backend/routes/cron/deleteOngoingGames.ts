import { NextApiRequest, NextApiResponse } from 'next'
import { collections, expireStaleGames } from '@backend/utils'

// Ends every unfinished game that hasn't been played for 30 days (see backend/utils/ongoingGames)
const deleteOngoingGames = async (req: NextApiRequest, res: NextApiResponse) => {
  const expired = await expireStaleGames()

  await collections.analytics?.findOneAndUpdate({}, { $inc: { deletedOngoingGames: expired } })

  res.status(200).send(`Expired ${expired} unfinished games`)
}

export default deleteOngoingGames
