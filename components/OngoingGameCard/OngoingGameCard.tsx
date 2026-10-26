import Link from 'next/link'
import { FC, useEffect, useRef } from 'react'
import { Avatar } from '@components/system'
import { ClockIcon, TrashIcon } from '@heroicons/react/outline'
import { LightningBoltIcon, PlayIcon } from '@heroicons/react/solid'
import { useAppSelector } from '@redux/hook'
import { OngoingGameType } from '@types'
import { COUNTRY_STREAK_DETAILS, DAILY_CHALLENGE_DETAILS } from '@utils/constants/random'
import { formatMonthDay, formatTimeAgo, getDaysLeft } from '@utils/dateHelpers'
import { formatLargeNumber, formatTimeLimit, getGameRules } from '@utils/helpers'
import { StyledOngoingGameCard } from './'

type Props = {
  game: OngoingGameType
  onRemove?: (game: OngoingGameType) => void
  ttlDays?: number
  // the game the player just saved and left: outlined and scrolled into view
  highlighted?: boolean
}

const STANDARD_ROUNDS = 5
const RULE_LABELS = { moving: 'Moving', nomove: 'No move', nmpz: 'NMPZ' }

// challenge games are resumed through their challenge, which keeps the shared locations in step
export const getOngoingGameHref = (game: OngoingGameType) =>
  game.challengeId ? `/challenge/${game.challengeId}` : `/game/${game._id}`

export const getOngoingGameTitle = (game: OngoingGameType) => {
  if (game.isDailyChallenge) return DAILY_CHALLENGE_DETAILS.name
  if (game.mode === 'streak') return COUNTRY_STREAK_DETAILS.name

  return game.mapName || 'Unknown map'
}

const OngoingGameCard: FC<Props> = ({ game, onRemove, ttlDays = 30, highlighted }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const userId = useAppSelector((state) => state.user.id)
  const notStarted = game.guessCount === 0
  const isStreak = game.mode === 'streak'
  const daysLeft = game.expiresAt ? getDaysLeft(game.expiresAt) : null

  const previewImg = game.isDailyChallenge
    ? DAILY_CHALLENGE_DETAILS.previewImg
    : isStreak
      ? COUNTRY_STREAK_DETAILS.previewImg
      : game.mapPreviewImg

  useEffect(() => {
    if (highlighted) {
      cardRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [highlighted])

  // "3 days ago" while recent, then the date ("on Sep 27") rather than a numeric one
  const lastPlayed = (() => {
    const date = new Date(game.lastPlayedAt)
    const ageDays = (Date.now() - date.getTime()) / 864e5

    return ageDays < 28 ? formatTimeAgo(date) : `on ${formatMonthDay(date)}`
  })()

  const getKind = () => {
    if (game.isDailyChallenge) return `Daily challenge · ${formatMonthDay(game.createdAt as unknown as Date)}`
    if (game.challengeId) {
      return game.challengeCreatorId === userId ? 'Your challenge' : `Challenge from ${game.challengeCreatorName}`
    }

    return isStreak ? 'Country streak' : 'Classic game'
  }

  const rules = [
    RULE_LABELS[getGameRules(game.gameSettings)],
    game.gameSettings.timeLimit ? `${formatTimeLimit(game.gameSettings.timeLimit)} per round` : '',
  ].filter(Boolean)

  const expiry = (() => {
    if (daysLeft === null) {
      return { label: 'Never expires', tone: 'calm', hint: 'Challenge games stay until you finish them' }
    }

    const hint = `Unfinished games are removed ${ttlDays} days after you last play them`

    if (daysLeft <= 1) return { label: 'Expires today', tone: 'urgent', hint }
    if (daysLeft <= 7) return { label: `Expires in ${daysLeft} days`, tone: 'soon', hint }

    return { label: `Expires in ${daysLeft} days`, tone: 'calm', hint }
  })()

  return (
    <StyledOngoingGameCard ref={cardRef} className={highlighted ? 'highlighted' : ''}>
      <div className="game-main">
        <Avatar type="map" src={previewImg} size={52} />

        <div className="game-text">
          <span className="game-kind">{getKind()}</span>
          <h3 className="game-title">{getOngoingGameTitle(game)}</h3>
          <div className="game-rules">
            {rules.map((rule) => (
              <span key={rule} className="rule-chip">
                {rule}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="game-progress">
        {isStreak ? (
          <span className="progress-label">
            {notStarted ? (
              'Not started yet'
            ) : (
              <>
                <LightningBoltIcon className="streak-icon" />
                {`Streak of ${game.streak}`}
              </>
            )}
          </span>
        ) : (
          <>
            {/* one segment per round: done, current, still to come */}
            <div
              className="round-track"
              role="img"
              aria-label={`${game.guessCount} of ${STANDARD_ROUNDS} rounds played`}
            >
              {Array.from({ length: STANDARD_ROUNDS }, (_, idx) => (
                <span
                  key={idx}
                  className={`round-step ${idx < game.guessCount ? 'done' : idx === game.guessCount ? 'current' : ''}`}
                />
              ))}
            </div>
            <span className="progress-label">
              {notStarted ? (
                'Not started yet'
              ) : (
                <>
                  {`Round ${game.round} of ${STANDARD_ROUNDS}`}
                  <span className="points">{`${formatLargeNumber(game.totalPoints)} pts`}</span>
                </>
              )}
            </span>
          </>
        )}

        <div className="game-meta">
          <span>{`${notStarted ? 'Opened' : 'Last played'} ${lastPlayed}`}</span>
          <span className={`expiry ${expiry.tone}`} title={expiry.hint}>
            <ClockIcon />
            {expiry.label}
          </span>
        </div>
      </div>

      <div className="game-actions">
        <Link href={getOngoingGameHref(game)}>
          <a className="continue-button">
            <PlayIcon />
            {notStarted ? 'Start' : 'Continue'}
          </a>
        </Link>

        {onRemove && (
          <button
            className="remove-button"
            onClick={() => onRemove(game)}
            aria-label={`Remove ${getOngoingGameTitle(game)} game`}
            title="Remove game"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </StyledOngoingGameCard>
  )
}

export default OngoingGameCard
