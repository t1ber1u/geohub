import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Game from '@backend/models/game'
import { NotFound } from '@components/errorViews'
import { StandardGameView, StreakGameView } from '@components/gameViews'
import { LoadingPage } from '@components/layout'
import { Meta } from '@components/Meta'
import { useAppDispatch } from '@redux/hook'
import { updateRecentlyPlayed } from '@redux/slices'
import StyledGamePage from '@styles/GamePage.Styled'
import { GameViewType, PageType } from '@types'
import { mailman } from '@utils/helpers'

const GamePage: PageType = () => {
  const [view, setView] = useState<GameViewType>('Game')
  const [gameData, setGameData] = useState<Game | null>()
  const [prevGameId, setPrevGameId] = useState('')
  const router = useRouter()
  const gameId = router.query.id as string
  const dispatch = useAppDispatch()

  const fetchGame = async () => {
    const res = await mailman(`games/${gameId}`)

    // If game not found -> show error page
    if (res.error) {
      return setGameData(null)
    }

    const { game, mapDetails, gameBelongsToUser } = res

    if (!gameBelongsToUser) {
      return setGameData(null)
    }

    // If game is completed, set view to Result
    if (game.state === 'finished') {
      setView('Result')
    }

    dispatch(updateRecentlyPlayed({ recentlyPlayed: [] }))

    setGameData({ ...game, mapDetails })
    setPrevGameId(gameId)
  }

  useEffect(() => {
    if (!gameId) {
      return
    }

    if (view === 'Game') {
      fetchGame()
    }
  }, [gameId, view])

  useEffect(() => {
    if (gameId !== prevGameId) {
      setView('Game')
    }
  }, [gameId])

  if (gameData === null) {
    return <NotFound title="Game Not Found" message="This game likely does not exist or does not belong to you." />
  }

  if (!gameData) {
    return <LoadingPage />
  }

  // an unfinished game that expired or was removed can't be continued; point the player somewhere useful
  if (gameData.state === 'abandoned') {
    const isStreak = gameData.mode === 'streak'
    const mapName = isStreak ? 'Country Streaks' : gameData.mapDetails?.name

    return (
      <NotFound
        title="This game has ended"
        message={
          gameData.abandonReason === 'removed'
            ? 'You removed it from your ongoing games, so it can no longer be continued.'
            : "It wasn't played for 30 days, so it was removed from your ongoing games."
        }
        actions={
          <>
            <Link href={isStreak ? '/streaks' : `/map/${gameData.mapId}`}>
              <a className="primary">{mapName ? `Play ${mapName} again` : 'Play again'}</a>
            </Link>
            <Link href="/ongoing">
              <a>Ongoing games</a>
            </Link>
          </>
        }
      />
    )
  }

  return (
    <StyledGamePage>
      <Meta title={`Game - GeoHub`} />

      {gameData.mode === 'standard' && (
        <StandardGameView gameData={gameData} setGameData={setGameData} view={view} setView={setView} />
      )}

      {gameData.mode === 'streak' && (
        <StreakGameView gameData={gameData} setGameData={setGameData} view={view} setView={setView} />
      )}
    </StyledGamePage>
  )
}

GamePage.noLayout = true

export default GamePage
