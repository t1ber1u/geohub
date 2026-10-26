import Link from 'next/link'
import { FC, ReactNode, useEffect, useState } from 'react'
import { SkeletonLeaderboard } from '@components/skeletons'
import { Avatar, Button } from '@components/system'
import { ChartBarIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/outline'
import { LightningBoltIcon, LocationMarkerIcon, StarIcon } from '@heroicons/react/solid'
import { useAppSelector } from '@redux/hook'
import { MapRankingsType, RankingsAttempt, RankingsEntry, RankingsPeriod, RankingsRules } from '@types'
import { formatDistance, formatLargeNumber, formatRoundTime, mailman, showToast } from '@utils/helpers'
import { StyledMapRankings } from './'
import ScoreDistribution from './ScoreDistribution'

const MAX_POINTS = 25000
// fewer players than this make a histogram of one or two bars, which says nothing
const MIN_PLAYERS_FOR_DISTRIBUTION = 3

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

const ATTEMPT_OPTIONS: { value: RankingsAttempt; label: string; hint: string }[] = [
  { value: 'best', label: 'Best game', hint: "Each player's best game counts" },
  { value: 'first', label: 'First attempt', hint: "Only each player's very first game on this map counts" },
]

const CHAMPION_LABEL: Record<RankingsPeriod, string> = {
  today: "Yesterday's champion",
  week: "Last week's champion",
  all: '',
}

const timeAgo = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)

  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`

  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const CrownIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 7.5l4.5 3.5L12 4l4.5 7L21 7.5 19 18H5L3 7.5zM5 19.5h14V21H5v-1.5z" />
  </svg>
)

type Props = {
  mapId: string
  onPlay?: () => void
}

const MapRankings: FC<Props> = ({ mapId, onPlay }) => {
  const [period, setPeriod] = useState<RankingsPeriod>('all')
  const [rules, setRules] = useState<RankingsRules>('moving')
  const [attempt, setAttempt] = useState<RankingsAttempt>('best')
  const [rankings, setRankings] = useState<MapRankingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const user = useAppSelector((state) => state.user)

  useEffect(() => {
    let cancelled = false

    const fetchRankings = async () => {
      setLoading(true)
      const res = await mailman(`leaderboard/${mapId}?period=${period}&rules=${rules}&attempt=${attempt}`)

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
  }, [mapId, period, rules, attempt, user.id])

  if (!rankings) {
    return <SkeletonLeaderboard />
  }

  const { entries, me, records, totalPlayers, champion } = rankings
  const isFirstAttempt = rankings.attempt === 'first'
  const meInTop = !!me && entries.some((entry) => entry.userId === me.userId)
  const periodHint = PERIOD_OPTIONS.find((option) => option.value === period)?.hint

  const renderRow = (entry: RankingsEntry, isMe: boolean) => {
    const isChampion = !!champion && champion.userId === entry.userId

    return (
      <div key={`${entry.userId}`} className={`ranking-row ${isMe ? 'is-me' : ''}`}>
        <span className={`rank ${entry.rank <= 3 ? `podium podium-${entry.rank}` : ''}`}>{entry.rank}</span>

        <div className="player">
          <Avatar type="user" src={entry.userAvatar?.emoji} backgroundColor={entry.userAvatar?.color} size={32} />
          <div className="player-details">
            <Link href={`/user/${entry.userId}`}>
              <a className="player-name">
                <span className="player-name-text">{entry.userName}</span>
                {isChampion && (
                  <span className="crown" title={CHAMPION_LABEL[period]}>
                    <CrownIcon />
                  </span>
                )}
                {isMe && <span className="you-tag">You</span>}
              </a>
            </Link>
            <span className="player-meta">
              {isFirstAttempt
                ? `First game · ${timeAgo(entry.achievedAt)}`
                : `${entry.gamesPlayed} ${entry.gamesPlayed === 1 ? 'game' : 'games'} · ${timeAgo(entry.achievedAt)}`}
            </span>
          </div>
        </div>

        <div className="score">
          <span className="points">{formatLargeNumber(entry.totalPoints)}</span>
          <div
            className="score-bar"
            title={`${Math.round((entry.totalPoints / MAX_POINTS) * 100)}% of ${formatLargeNumber(MAX_POINTS)}`}
          >
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
  }

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
      if (!totalPlayers) return null

      return (
        <span>
          {isFirstAttempt
            ? 'Only your first game on this map counts here'
            : 'Finish a game with these settings to get ranked'}
        </span>
      )
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

  const emptyMessage = () => {
    const when = period === 'today' ? ' today' : period === 'week' ? ' this week' : ''

    return isFirstAttempt
      ? `No first attempts${when} with these settings yet.`
      : `Nobody has played${when} with these settings yet.`
  }

  const summary = renderSummary()

  return (
    <StyledMapRankings>
      <div className="rankings-header">
        <div className="title-row">
          <div className="title-wrapper">
            <span className="title">Leaderboard</span>
            <button
              className={`help-button ${showHelp ? 'active' : ''}`}
              onClick={() => setShowHelp(!showHelp)}
              aria-expanded={showHelp}
              aria-label="How rankings work"
              title="How rankings work"
            >
              <InformationCircleIcon />
            </button>
          </div>

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

        <div className="filters-row">
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

          <div className="segmented small" role="tablist" aria-label="Which games count">
            {ATTEMPT_OPTIONS.map((option) => (
              <button
                key={option.value}
                role="tab"
                aria-selected={attempt === option.value}
                className={attempt === option.value ? 'active' : ''}
                title={option.hint}
                onClick={() => setAttempt(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <span className="players-count">
          {`${formatLargeNumber(totalPlayers)} ${totalPlayers === 1 ? 'player' : 'players'}`}
          {isFirstAttempt && ' · first games only'}
          {periodHint && ` · ${periodHint.replace('Resets', 'resets')}`}
        </span>

        {showHelp && (
          <ul className="help-panel">
            <li>
              <strong>Best game:</strong> your highest score counts. Ties go to whoever was faster.
            </li>
            <li>
              <strong>First attempt:</strong> only your very first game on this map counts, so nobody can learn the
              locations first. Starting a game counts, even if you leave it.
            </li>
            <li>
              <strong>Moving, No move, NMPZ:</strong> games only compete with games played under the same rules.
            </li>
            <li>
              <strong>Today and This week</strong> reset at 00:00 UTC (weeks on Monday). Last period&apos;s #1 wears the
              crown.
            </li>
          </ul>
        )}
      </div>

      {champion && period !== 'all' && (
        <div className="champion-strip">
          <span className="crown">
            <CrownIcon />
          </span>
          <span className="champion-label">{CHAMPION_LABEL[period]}</span>
          <Link href={`/user/${champion.userId}`}>
            <a className="champion-name">{champion.userName}</a>
          </Link>
          <span className="champion-points">{`${formatLargeNumber(champion.totalPoints)} points`}</span>
        </div>
      )}

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
          <div className="empty-state">
            <span>{emptyMessage()}</span>
            {onPlay && (
              <Button className="empty-play-button" onClick={onPlay}>
                {isFirstAttempt ? 'Play now' : 'Play now and claim #1'}
              </Button>
            )}
          </div>
        )}

        {summary && <div className="my-summary">{summary}</div>}
      </div>

      {totalPlayers >= MIN_PLAYERS_FOR_DISTRIBUTION && (
        <ScoreDistribution
          distribution={rankings.distribution}
          myPoints={me?.totalPoints}
          isFirstAttempt={isFirstAttempt}
        />
      )}

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
