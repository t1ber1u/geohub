import { useRouter } from 'next/router'
import { FC } from 'react'
import { AuthMode, AuthPanel } from '@components/AuthPanel'
import { Modal } from '@components/system'
import { XIcon } from '@heroicons/react/outline'
import { StyledAuthModal } from './'

type Props = {
  isOpen: boolean
  closeModal: () => void
  mode?: AuthMode
  // where Google/Apple/Facebook bring the player back to (defaults to the current page)
  callbackUrl?: string
  // called after an in-place email sign-in, e.g. to start the game they were about to play
  onSuccess?: () => void
  heading?: string
  subheading?: string
}

// Sign in without leaving the page, e.g. when a logged out player presses Play
const AuthModal: FC<Props> = ({ isOpen, closeModal, mode = 'signup', callbackUrl, onSuccess, heading, subheading }) => {
  const router = useRouter()

  const handleSuccess = () => {
    closeModal()
    onSuccess?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} maxWidth="440px">
      <StyledAuthModal>
        <button className="close-button" onClick={closeModal} aria-label="Close">
          <XIcon />
        </button>

        <div className="mainContent">
          <AuthPanel
            initialMode={mode}
            callbackUrl={callbackUrl || router.asPath}
            onSuccess={handleSuccess}
            heading={heading}
            subheading={subheading}
          />
        </div>
      </StyledAuthModal>
    </Modal>
  )
}

export default AuthModal
