import { ObjectId } from 'mongodb'
import { DistanceType, GameSettingsType, GuessType, LocationType, MapType } from '@types'
import User from './user'

type Game = {
  id?: ObjectId
  _id?: ObjectId // replace id with _id throughout app
  mapId: string
  mapName?: string
  userId: ObjectId
  userName?: string
  userAvatar?: { emoji: string; color: string }
  gameSettings: GameSettingsType
  rounds: LocationType[]
  guesses: GuessType[]
  round: number
  totalPoints: number
  totalDistance: DistanceType
  totalTime: number
  difficulty?: 'Normal' | 'Easy' | 'Challenging'
  countryCode?: string
  challengeId?: ObjectId | string | null
  userDetails?: User
  createdAt?: Date
  lastPlayedAt?: Date // when the last guess was made; unfinished games expire 30 days after it
  mapDetails?: MapType
  // abandoned: an unfinished game that expired or that its player removed
  state: 'started' | 'finished' | 'abandoned'
  abandonReason?: 'expired' | 'removed'
  mode: 'standard' | 'streak'
  streak: number
  isDailyChallenge?: boolean
}

export default Game
