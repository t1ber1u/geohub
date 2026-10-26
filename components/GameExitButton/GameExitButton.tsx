import Link from 'next/link'
import { FC } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import { StyledGameExitButton } from './'

type Props = {
  gameId?: string
}

// Every guess is saved as it is made, so leaving is safe: the game waits in Ongoing Games
const GameExitButton: FC<Props> = ({ gameId }) => {
  return (
    <StyledGameExitButton>
      <Link href={gameId ? `/ongoing?saved=${gameId}` : '/ongoing'}>
        <a className="exit-button" title="Your progress is saved. Continue any time from Ongoing Games.">
          <ArrowLeftIcon />
          <span className="exit-label">Save &amp; exit</span>
        </a>
      </Link>
    </StyledGameExitButton>
  )
}

export default GameExitButton
