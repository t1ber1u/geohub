import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { PageHeader, WidthController } from '@components/layout'
import { Meta } from '@components/Meta'
import { AuthModal, DestroyModal } from '@components/modals'
import { getOngoingGameTitle, OngoingGameCard } from '@components/OngoingGameCard'
import { Spinner } from '@components/system'
import { InformationCircleIcon, PlayIcon, SparklesIcon } from '@heroicons/react/outline'
import { useAppSelector } from '@redux/hook'
import StyledOngoingGamesPage from '@styles/OngoingGamesPage.Styled'
import { OngoingGameType } from '@types'
import { formatLargeNumber, mailman, showToast } from '@utils/helpers'
import { useBreakpoint } from '@utils/hooks'

const OngoingGamesPage: NextPage = () => {
  const [games, setGames] = useState<OngoingGameType[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [notStartedCount, setNotStartedCount] = useState(0)
  const [ttlDays, setTtlDays] = useState(30)
  const [gameToRemove, setGameToRemove] = useState<OngoingGameType | null>(null)
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [savedGameId, setSavedGameId] = useState('')
  const router = useRouter()
  const user = useAppSelector((state) => state.user)
  const { status } = useSession()
  const { isBreakpoint } = useBreakpoint()

  // the stored user appears a moment after sign-in, so (re)load whenever it changes
  useEffect(() => {
    if (status === 'loading') return

    if (!user.id) {
      setGames([])
      return setLoading(false)
    }

    setLoading(true)
    fetchGames(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, status])

  // arriving from "Save & exit" in a game
  useEffect(() => {
    const saved = router.query.saved

    if (typeof saved !== 'string') return

    setSavedGameId(saved)
    showToast('success', 'Game saved. Continue it whenever you like.')
    router.replace('/ongoing', undefined, { shallow: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.saved])

  const fetchGames = async (pageToLoad: number) => {
    const res = await mailman(`games/unfinished?page=${pageToLoad}`)

    if (!res || res.error) {
      setLoading(false)
      return showToast('error', res?.error?.message || 'Could not load your ongoing games')
    }

    setGames((prev) => (pageToLoad === 0 ? res.data : prev.concat(res.data)))
    setHasMore(res.hasMore)
    setTotal(res.total)
    setNotStartedCount(res.notStartedCount)
    setTtlDays(res.ttlDays)
    setPage(pageToLoad + 1)
    setLoading(false)
  }

  const removeGame = async (game: OngoingGameType) => {
    setIsSubmitting(true)

    const res = await mailman(`games/${game._id}`, 'DELETE')

    setIsSubmitting(false)

    if (!res || res.error) {
      return showToast('error', res?.error?.message || 'Could not remove the game')
    }

    setGameToRemove(null)
    setGames((prev) => prev.filter((g) => g._id !== game._id))
    setTotal((prev) => prev - 1)

    if (game.guessCount === 0 && !game.challengeId) {
      setNotStartedCount((prev) => Math.max(0, prev - 1))
    }

    showToast('success', `${getOngoingGameTitle(game)} game removed`)
  }

  // nothing is lost by removing a game that hasn't been played yet, so skip the confirmation
  const handleRemove = (game: OngoingGameType) => {
    if (game.guessCount === 0) {
      return removeGame(game)
    }

    setGameToRemove(game)
  }

  const clearUnstartedGames = async () => {
    setIsSubmitting(true)

    const res = await mailman('games/unfinished', 'DELETE')

    setIsSubmitting(false)

    if (!res || res.error) {
      return showToast('error', res?.error?.message || 'Could not clear the games')
    }

    setClearModalOpen(false)
    showToast('success', `Cleared ${res.removed} unstarted ${res.removed === 1 ? 'game' : 'games'}`)
    fetchGames(0)
  }

  const removeMessage = (game: OngoingGameType) => {
    const progress =
      game.mode === 'streak'
        ? `your streak of ${game.streak}`
        : `round ${game.round} of 5 with ${formatLargeNumber(game.totalPoints)} points`

    const consequence = game.challengeId
      ? "Your progress in this challenge will be lost and you'll have to start it again."
      : "You won't be able to continue it."

    return `You're on ${progress}. ${consequence}`
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="games-list">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="card-skeleton" />
          ))}
        </div>
      )
    }

    if (!user.id) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            <PlayIcon />
          </div>
          <h2>Pick up where you left off</h2>
          <p>Sign in and any game you leave before the end is saved here, so you can finish it later.</p>
          <button className="empty-action" onClick={() => setAuthModalOpen(true)}>
            Sign in
          </button>
        </div>
      )
    }

    if (games.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            <SparklesIcon />
          </div>
          <h2>No games in progress</h2>
          <p>Games you leave before the final round show up here, so you can finish them any time.</p>
          <Link href="/maps">
            <a className="empty-action">Find a map to play</a>
          </Link>
        </div>
      )
    }

    return (
      <InfiniteScroll
        dataLength={games.length}
        next={() => fetchGames(page)}
        hasMore={hasMore}
        loader={
          <div className="list-loader">
            <Spinner size={24} />
          </div>
        }
        key={isBreakpoint ? 1 : 0}
        scrollableTarget={isBreakpoint ? undefined : 'main'}
        className="games-list"
      >
        {games.map((game) => (
          <OngoingGameCard
            key={game._id}
            game={game}
            onRemove={handleRemove}
            ttlDays={ttlDays}
            highlighted={game._id === savedGameId}
          />
        ))}
      </InfiniteScroll>
    )
  }

  return (
    <StyledOngoingGamesPage>
      <WidthController customWidth="1000px">
        <Meta title="Ongoing Games" />
        <PageHeader>Ongoing Games</PageHeader>

        <div className="page-intro">
          <p className="intro-text">
            <InformationCircleIcon />
            <span>
              {`Your unfinished games are saved here. Each one is kept for ${ttlDays} days after you last play it, so play a round to keep it longer. Challenges never expire.`}
            </span>
          </p>

          {!loading && user.id && games.length > 0 && (
            <div className="toolbar">
              <span className="games-count">{`${total} ${total === 1 ? 'game' : 'games'} in progress`}</span>

              {notStartedCount > 0 && (
                <button className="clear-button" onClick={() => setClearModalOpen(true)}>
                  {`Clear ${notStartedCount} unstarted ${notStartedCount === 1 ? 'game' : 'games'}`}
                </button>
              )}
            </div>
          )}
        </div>

        {renderContent()}

        <DestroyModal
          isOpen={!!gameToRemove}
          onClose={() => setGameToRemove(null)}
          onAction={() => gameToRemove && removeGame(gameToRemove)}
          title={gameToRemove ? `Remove your ${getOngoingGameTitle(gameToRemove)} game?` : 'Remove game?'}
          message={gameToRemove ? removeMessage(gameToRemove) : ''}
          isSubmitting={isSubmitting}
          actionLabel="Remove game"
        />

        <DestroyModal
          isOpen={clearModalOpen}
          onClose={() => setClearModalOpen(false)}
          onAction={() => clearUnstartedGames()}
          title={`Clear ${notStartedCount} unstarted ${notStartedCount === 1 ? 'game' : 'games'}?`}
          message="These are games you opened but never made a guess in. Challenges are not affected."
          isSubmitting={isSubmitting}
          actionLabel="Clear games"
        />

        <AuthModal
          isOpen={authModalOpen}
          closeModal={() => setAuthModalOpen(false)}
          mode="login"
          heading="Sign in to see your games"
          subheading="Your unfinished games are saved to your account."
        />
      </WidthController>
    </StyledOngoingGamesPage>
  )
}

export default OngoingGamesPage
