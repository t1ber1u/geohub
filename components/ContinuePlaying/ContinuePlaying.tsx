import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { OngoingGameCard } from '@components/OngoingGameCard'
import { useAppSelector } from '@redux/hook'
import { OngoingGameType } from '@types'
import { mailman } from '@utils/helpers'
import { StyledContinuePlaying } from './'

// Home page shortcut back into the player's most recently played unfinished game
const ContinuePlaying: FC = () => {
  const [game, setGame] = useState<OngoingGameType | null>(null)
  const [total, setTotal] = useState(0)
  const [ttlDays, setTtlDays] = useState(30)
  const userId = useAppSelector((state) => state.user.id)

  useEffect(() => {
    if (!userId) {
      return setGame(null)
    }

    let active = true

    mailman('games/unfinished?page=0').then((res) => {
      if (!active || !res || res.error) return

      // only games actually under way; ones merely opened stay on the Ongoing Games page
      setGame(res.data.find((g: OngoingGameType) => g.guessCount > 0) ?? null)
      setTotal(res.total)
      setTtlDays(res.ttlDays)
    })

    return () => {
      active = false
    }
  }, [userId])

  if (!game) return null

  return (
    <StyledContinuePlaying>
      <div className="section-header">
        <h2 className="section-title">Continue where you left off</h2>
        {total > 1 && (
          <Link href="/ongoing">
            <a className="see-all">{`See all ${total} ongoing games`}</a>
          </Link>
        )}
      </div>

      <OngoingGameCard game={game} ttlDays={ttlDays} />
    </StyledContinuePlaying>
  )
}

export default ContinuePlaying
