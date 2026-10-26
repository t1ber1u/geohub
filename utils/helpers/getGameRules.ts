import { GameSettingsType, RankingsRules } from '@types'

// Which leaderboard a game competes on, mirroring the rules filter in getMapRankings
const getGameRules = (settings: GameSettingsType): RankingsRules => {
  if (settings.canMove !== false) return 'moving'
  if (settings.canPan === false && settings.canZoom === false) return 'nmpz'

  return 'nomove'
}

export default getGameRules
