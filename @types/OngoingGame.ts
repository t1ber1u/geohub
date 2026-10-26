import { GameSettingsType } from '.'

// An unfinished game as the ongoing games list returns it
type OngoingGame = {
  _id: string
  mode: 'standard' | 'streak'
  mapId: string
  mapName?: string
  mapPreviewImg?: string
  challengeId?: string | null
  challengeCreatorId?: string
  challengeCreatorName?: string
  isDailyChallenge?: boolean
  gameSettings: GameSettingsType
  round: number
  totalPoints: number
  streak: number
  guessCount: number
  createdAt: string
  lastPlayedAt: string
  // null for challenge games, which never expire
  expiresAt: string | null
}

export default OngoingGame
