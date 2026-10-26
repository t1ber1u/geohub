import { Document, ObjectId } from 'mongodb'
import { collections } from './dbConnect'

/**
 * Unfinished games are kept for this many days after they were last played (each guess resets the clock).
 * Challenge games (friend challenges and the daily challenge) never expire: their locations are fixed,
 * so removing one would let the player start the same challenge over.
 */
export const ONGOING_GAME_TTL_DAYS = 30

const TTL_MS = ONGOING_GAME_TTL_DAYS * 24 * 60 * 60 * 1000

// games from before lastPlayedAt existed fall back to when they were created
export const lastPlayedExpr = { $ifNull: ['$lastPlayedAt', '$createdAt'] }

export const getExpiresAt = (game: Document) => {
  if (game.challengeId) return null

  const lastPlayed = new Date(game.lastPlayedAt ?? game.createdAt)

  return new Date(lastPlayed.getTime() + TTL_MS)
}

export const isGameExpired = (game: Document) => {
  const expiresAt = getExpiresAt(game)

  return game.state === 'started' && !!expiresAt && expiresAt.getTime() <= Date.now()
}

/**
 * Takes games off the ongoing list for good. The record is kept, without its locations and guesses, marked
 * 'abandoned': the "first attempt" leaderboard counts a player's first game on a map even when it was never
 * finished, so peeking at a game and dropping it can't buy a second first attempt.
 */
export const abandonGames = async (filter: Document, reason: 'expired' | 'removed') => {
  const result = await collections.games?.updateMany(
    { ...filter, state: 'started' },
    {
      $set: { state: 'abandoned', abandonedAt: new Date(), abandonReason: reason },
      $unset: { rounds: '', guesses: '' },
    },
  )

  return result?.modifiedCount ?? 0
}

// Expires a player's (or everyone's) stale unfinished games; run before listing or opening games
export const expireStaleGames = async (userId?: string | ObjectId) => {
  return abandonGames(
    {
      ...(userId && { userId: new ObjectId(userId) }),
      challengeId: null,
      $expr: { $lt: [lastPlayedExpr, new Date(Date.now() - TTL_MS)] },
    },
    'expired',
  )
}
