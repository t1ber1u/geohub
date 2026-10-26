import Link from 'next/link'
import { FC, ReactNode, useEffect, useState } from 'react'
import { SkeletonLeaderboard } from '@components/skeletons'
import { Avatar } from '@components/system'
import { ChartBarIcon, ClockIcon } from '@heroicons/react/outline'
import { LightningBoltIcon, LocationMarkerIcon, StarIcon } from '@heroicons/react/solid'
import { useAppSelector } from '@redux/hook'
import { MapRankingsType, RankingsEntry, RankingsPeriod, RankingsRules } from '@types'
import { formatDistance, formatLargeNumber, formatRoundTime, mailman, showToast } from '@utils/helpers'
import { StyledMapRankings } from './'

const MAX_POINTS = 25000

const PERIOD_OPTIONS: { value: RankingsPeriod; label: string; hint?: string }[] = [
  { value: 'today', label: 'Today', hint: 'Resets daily at 00:00 UTC' },
  { value: 'week', label: 'This week', hint: 'Resets Mondays at 00:00 UTC' },
  { value: 'all', label: 'All time' },
]

const RULES_OPTIONS: { value: RankingsRules; label: string; hint: string }[] = [
  { value: 'moving', label: 'Moving', hint: 'Games where moving around was allowed' },
  { value: 'nomove', label: 'No move', hint: 'Games without moving (panning or zooming allowed)' },
  { value: 'nmpz', label: 'NMPZ', hint: 'No moving, panning or zooming' },
]

const timeAgo = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)

  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`

  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

type Props = {
  mapId: string
}

const MapRankings: FC<Props> = ({ mapId }) => {
  const [period, setPeriod] = useState<RankingsPeriod>('all')
  const [rules, setRules] = useState<RankingsRules>('moving')
  const [rankings, setRankings] = useState<MapRankingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const user = useAppSelector((state) => state.user)

  useEffect(() => {
    let cancelled = false

    const fetchRankings = async () => {
      setLoading(true)
      const res = await mailman(`leaderboard/${mapId}?period=${period}&rules=${rules}`)

      if (cancelled) return
      setLoading(false)

      if (res.error) {
        return showToast('error', res.error.message)
      }

      setRankings(res)
    }

    fetchRankings()

    return () => {
      cancelled = true
    }
  }, [mapId, period, rules, user.id])

  if (!rankings) {
    return <SkeletonLeaderboard />
  }

  const { entries, me, records, totalPlayers } = rankings
  const meInTop = !!me && entries.some((entry) => entry.userId === me.userId)
  const periodHint = PERIOD_OPTIONS.find((option) => option.value === period)?.hint

  const renderRow = (entry: RankingsEntry, isMe: boolean) => (
    <div key={`${entry.userId}`} className={`ranking-row ${isMe ? 'is-me' : ''}`}>
      <span className={`rank ${entry.rank <= 3 ? `podium podium-${entry.rank}` : ''}`}>{entry.rank}</span>

      <div className="player">
        <Avatar type="user" src={entry.userAvatar?.emoji} backgroundColor={entry.userAvatar?.color} size={32} />
        <div className="player-details">
          <Link href={`/user/${entry.userId}`}>
            <a className="player-name">
              {entry.userName}
              {isMe && <span className="you-tag">You</span>}
            </a>
          </Link>
          <span className="player-meta">
            {`${entry.gamesPlayed} ${entry.gamesPlayed === 1 ? 'game' : 'games'} · ${timeAgo(entry.achievedAt)}`}
          </span>
        </div>
      </div>

      <div className="score">
        <span className="points">{formatLargeNumber(entry.totalPoints)}</span>
        <div className="score-bar" title={`${Math.round((entry.totalPoints / MAX_POINTS) * 100)}% of ${formatLargeNumber(MAX_POINTS)}`}>
          <div style={{ width: `${(entry.totalPoints / MAX_POINTS) * 100}%` }} />
        </div>
      </div>

      <span
        className={`perfect ${entry.perfectRounds ? '' : 'none'}`}
        title={`${entry.perfectRounds} perfect ${entry.perfectRounds === 1 ? 'round' : 'rounds'} (5,000 points)`}
      >
        <StarIcon />
        {entry.perfectRounds}
      </span>

      <span className="time" title={entry.timeLimit ? `Timed game: ${entry.timeLimit} sec per round` : 'Total time'}>
        {entry.timeLimit > 0 && <ClockIcon />}
        {formatRoundTime(entry.totalTime)}
      </span>

      <Link href={`/results/${entry.gameId}`}>
        <a className="results-link" title="View this game's rounds">
          <ChartBarIcon />
        </a>
      </Link>
    </div>
  )

  const renderSummary = () => {
    if (!user.id) {
      return (
        <span>
          <Link href="/login">
            <a className="summary-link">Log in</a>
          </Link>
          {' to see your rank'}
        </span>
      )
    }

    if (!me) {
      return <span>{totalPlayers ? 'Finish a game with these settings to get ranked' : ''}</span>
    }

    if (me.rank === 1) {
      return (
        <span>
          <strong>{`You're #1`}</strong>
          {totalPlayers > 1 ? ` of ${formatLargeNumber(totalPlayers)} players` : ''}
        </span>
      )
    }

    return (
      <span>
        <strong>{`#${me.rank}`}</strong>
        {` of ${formatLargeNumber(totalPlayers)}`}
        {me.topPercent <= 50 && ` · Top ${me.topPercent}%`}
        {me.next &&
          (me.next.pointsBehind > 0
            ? ` · ${formatLargeNumber(me.next.pointsBehind)} points to pass #${me.next.rank} ${me.next.userName}`
            : ` · tied with #${me.next.rank} ${me.next.userName}, be faster to pass them`)}
      </span>
    )
  }

  const renderRecord = (icon: ReactNode, label: string, value: string | null, holder?: ReactNode) => (
    <div className="record">
      <div className="record-icon">{icon}</div>
      <div className="record-details">
        <span className="record-label">{label}</span>
        <span className="record-value">{value ?? '—'}</span>
        {holder && <span className="record-holder">{holder}</span>}
      </div>
    </div>
  )

  const holderLink = (record: { userId: unknown; userName: string } | null, gameId?: unknown) =>
    record && (
      <Link href={gameId ? `/results/${gameId}` : `/user/${record.userId}`}>
        <a>{record.userName}</a>
      </Link>
    )

  return (
    <StyledMapRankings>
      <div className="rankings-header">
        <div className="title-row">
          <span className="title">Leaderboard</span>
          <div className="segmented" role="tablist" aria-label="Time period">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                role="tab"
                aria-selected={period === option.value}
                className={period === option.value ? 'active' : ''}
                title={option.hint}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rules-row">
          <div className="chips" role="tablist" aria-label="Game rules">
            {RULES_OPTIONS.map((option) => (
              <button
                key={option.value}
                role="tab"
                aria-selected={rules === option.value}
                className={rules === option.value ? 'active' : ''}
                title={option.hint}
                onClick={() => setRules(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="players-count">
            {`${formatLargeNumber(totalPlayers)} ${totalPlayers === 1 ? 'player' : 'players'}`}
            {periodHint && ` · ${periodHint.replace('Resets', 'resets')}`}
          </span>
        </div>
      </div>

      <div className={`rankings-body ${loading ? 'loading' : ''}`}>
        {entries.length > 0 ? (
          <>
            {entries.map((entry) => renderRow(entry, !!me && entry.userId === me.userId))}

            {me && !meInTop && (
              <>
                <div className="gap-divider" />
                {renderRow(me, true)}
              </>
            )}
          </>
        ) : (
          <span className="empty-message">
            {period === 'all'
              ? 'No games with these settings yet. Play now and claim the top spot!'
              : `Nobody has played ${period === 'today' ? 'today' : 'this week'} with these settings yet. Be the first!`}
          </span>
        )}

        <div className="my-summary">{renderSummary()}</div>
      </div>

      <div className="records">
        {renderRecord(
          <LocationMarkerIcon />,
          'Closest guess',
          records.closestGuess && formatDistance(records.closestGuess.distance, user.distanceUnit),
          holderLink(records.closestGuess, records.closestGuess?.gameId)
        )}
        {renderRecord(
          <LightningBoltIcon />,
          'Fastest perfect round',
          records.fastestPerfect && formatRoundTime(records.fastestPerfect.time),
          holderLink(records.fastestPerfect, records.fastestPerfect?.gameId)
        )}
        {renderRecord(
          <StarIcon />,
          'Most perfect rounds',
          records.mostPerfect && formatLargeNumber(records.mostPerfect.count)!,
          holderLink(records.mostPerfect)
        )}
      </div>
    </StyledMapRankings>
  )
}

export default MapRankings
