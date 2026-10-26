import { useEffect, useState } from 'react'
import { WidthController } from '@components/layout'
import { MapLeaderboard } from '@components/MapLeaderboard'
import { Meta } from '@components/Meta'
import { AuthModal, GameSettingsModal } from '@components/modals'
import { SkeletonLeaderboard, SkeletonMapInfo } from '@components/skeletons'
import { StreakMapStats } from '@components/StreakMapStats'
import { Avatar, Button } from '@components/system'
import { VerifiedBadge } from '@components/VerifiedBadge'
import StyledPlayStreaksPage from '@styles/PlayStreaksPage.Styled'
import { MapLeaderboardType, StreakStatsType } from '@types'
import { COUNTRY_STREAK_DETAILS } from '@utils/constants/random'
import { mailman, showToast } from '@utils/helpers'
import { useSignInToPlay } from '@utils/hooks'

const StreaksPage = () => {
  const [streakStats, setStreakStats] = useState<StreakStatsType>()
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  useEffect(() => {
    getStreakStats()
  }, [])

  const getStreakStats = async () => {
    const res = await mailman('streaks/stats')

    if (res.error) {
      return showToast('error', res.error.message)
    }

    setStreakStats(res)
  }

  const { requestPlay: handleClickPlay, authModalProps } = useSignInToPlay(() => setSettingsModalOpen(true))

  return (
    <StyledPlayStreaksPage>
      <WidthController customWidth="1100px" mobilePadding="0px">
        <Meta title="Country Streaks" />

        {streakStats ? (
          <div className="mapDetailsSection">
            <div className="mapDescriptionWrapper">
              <div className="descriptionColumnWrapper">
                <div className="descriptionColumn">
                  <Avatar type="map" src={COUNTRY_STREAK_DETAILS.previewImg} size={50} />
                  <div className="map-details">
                    <div className="name-container">
                      <div className="name-wrapper">
                        <span className="name">{COUNTRY_STREAK_DETAILS.name}</span>
                      </div>
                      <VerifiedBadge size={20} />
                    </div>
                    <span className="description">{COUNTRY_STREAK_DETAILS.description}</span>
                  </div>
                </div>
                <Button className="play-button" onClick={() => handleClickPlay()}>
                  Play Now
                </Button>
              </div>
            </div>

            <div className="statsWrapper">
              <StreakMapStats streakStats={streakStats} />
            </div>
          </div>
        ) : (
          <SkeletonMapInfo />
        )}

        {streakStats ? (
          <MapLeaderboard leaderboard={streakStats.scores as MapLeaderboardType[]} />
        ) : (
          <SkeletonLeaderboard />
        )}
      </WidthController>

      <GameSettingsModal
        isOpen={settingsModalOpen}
        closeModal={() => setSettingsModalOpen(false)}
        mapDetails={COUNTRY_STREAK_DETAILS}
        gameMode="streak"
      />

      <AuthModal
        {...authModalProps}
        heading="Sign in to play Country Streaks"
        subheading="It's free. Your best streak is saved and ranked on the leaderboard."
      />
    </StyledPlayStreaksPage>
  )
}

export default StreaksPage
