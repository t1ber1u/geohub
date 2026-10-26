import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { Game } from '@backend/models'
import { MapRankingsType, RankingsMe } from '@types'
import { formatLargeNumber, getGameRules, mailman } from '@utils/helpers'
import { StyledRankCallout } from './'

const RULES_LABEL = { moving: '', nomove: ' · No move', nmpz: ' · NMPZ' }

type Standing = { label: string; me: RankingsMe; total: number }

type Props = {
  gameData: Game
}

// Where a just-finished game puts the player on the map's leaderboards
const RankCallout: FC<Props> = ({ gameData }) => {
  const [standings, setStandings] = useState<{ best: RankingsMe | null; rows: Standing[] } | null>(null)

  const gameId = String(gameData._id)
  const rules = getGameRules(gameData.gameSettings)

  useEffect(() => {
    const fetchStandings = async () => {
      const query = (period: string, attempt: string) =>
        mailman(`leaderboard/${gameData.mapId}?period=${period}&rules=${rules}&attempt=${attempt}`) as Promise<MapRankingsType>

      const [allTime, thisWeek, firstAttempt] = await Promise.all([
        query('all', 'best'),
        query('week', 'best'),
        query('all', 'first'),
      ])

      if ((allTime as any).error) return

      const rows: Standing[] = []
      const add = (label: string, rankings: MapRankingsType, onlyThisGame = false) => {
        if (!rankings?.me || (onlyThisGame && String(rankings.me.gameId) !== gameId)) return
        rows.push({ label, me: rankings.me, total: rankings.totalPlayers })
      }

      add('All time', allTime)
      add('This week', thisWeek)
      // only when this game was the player's first attempt on the map
      add('First attempt', firstAttempt, true)

      setStandings({ best: allTime.me, rows })
    }

    fetchStandings()
  }, [gameId, gameData.mapId, rules])

  if (!standings?.best) return null

  const { best, rows } = standings
  const isPersonalBest = String(best.gameId) === gameId

  const headline = () => {
    if (isPersonalBest && best.rank === 1) return `You're #1 on ${gameData.mapName}!`
    if (isPersonalBest && best.gamesPlayed === 1) return `You're on the ${gameData.mapName} leaderboard!`
    if (isPersonalBest) return 'New personal best!'

    return `Your best on ${gameData.mapName}: ${formatLargeNumber(best.totalPoints)} points`
  }

  return (
    <StyledRankCallout>
      <span className={`headline ${isPersonalBest ? 'celebrate' : ''}`}>
        {isPersonalBest && <span aria-hidden="true">🏆 </span>}
        {headline()}
      </span>

      <div className="standings">
        {rows.map(({ label, me, total }) => (
          <div key={label} className="standing">
            <span className="standing-rank">{`#${me.rank}`}</span>
            <span className="standing-label">{`${label} · of ${formatLargeNumber(total)}`}</span>
          </div>
        ))}
      </div>

      <span className="next-target">
        {best.next &&
          best.next.pointsBehind > 0 &&
          `${formatLargeNumber(best.next.pointsBehind)} points to pass #${best.next.rank} ${best.next.userName} · `}
        <Link href={`/map/${gameData.mapId}`}>
          <a className="leaderboard-link">{`See the leaderboard${RULES_LABEL[rules]}`}</a>
        </Link>
      </span>
    </StyledRankCallout>
  )
}

export default RankCallout
