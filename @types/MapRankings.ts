import { ObjectId } from 'mongodb'
import DistanceType from './Distance'

export type RankingsPeriod = 'today' | 'week' | 'all'

// Games only compete against games played under the same movement rules
export type RankingsRules = 'moving' | 'nomove' | 'nmpz'

// best: each player's best game; first: only each player's first game on the map (no memorising locations)
export type RankingsAttempt = 'best' | 'first'

type RankedPlayer = {
  userId: ObjectId | string
  userName: string
  userAvatar: { emoji: string; color: string }
}

export type RankingsEntry = RankedPlayer & {
  rank: number
  gameId: ObjectId | string
  totalPoints: number
  totalTime: number
  perfectRounds: number
  gamesPlayed: number
  timeLimit: number
  achievedAt: string
}

export type RankingsMe = RankingsEntry & {
  // percentage of ranked players at or above this rank, e.g. 15 means "Top 15%"
  topPercent: number
  next: { rank: number; userName: string; pointsBehind: number } | null
}

export type RankingsRecords = {
  closestGuess: (RankedPlayer & { gameId: ObjectId | string; distance: DistanceType }) | null
  fastestPerfect: (RankedPlayer & { gameId: ObjectId | string; time: number }) | null
  mostPerfect: (RankedPlayer & { count: number }) | null
}

type MapRankings = {
  period: RankingsPeriod
  rules: RankingsRules
  attempt: RankingsAttempt
  totalPlayers: number
  // #1 of the previous day/week (same rules and attempt type), shown with a crown
  champion: (RankedPlayer & { totalPoints: number }) | null
  entries: RankingsEntry[]
  me: RankingsMe | null
  records: RankingsRecords
  // how the ranked players' scores are spread, in bins of binSize points
  distribution: { binSize: number; counts: number[]; average: number }
}

export default MapRankings
