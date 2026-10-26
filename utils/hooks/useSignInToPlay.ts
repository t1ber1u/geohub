import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '@redux/hook'

const PLAY_PARAM = 'play'

// The current page with ?play=1, so a player coming back from Google/Apple/Facebook carries on
const withPlayParam = (asPath: string) => {
  const [path] = asPath.split('#')

  if (new RegExp(`[?&]${PLAY_PARAM}=1(&|$)`).test(path)) return path

  return `${path}${path.includes('?') ? '&' : '?'}${PLAY_PARAM}=1`
}

/**
 * Gates a "play" action behind signing in without losing the player's place:
 * logged out players get the sign-in modal, and once they are in (straight away for email,
 * after the redirect for Google/Apple/Facebook) the action they wanted runs.
 * `play` must not check for a user itself, it runs right after sign-in.
 * `ready` holds a returning player back until the page has loaded what `play` needs.
 */
const useSignInToPlay = (play: () => void, ready = true) => {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const userId = useAppSelector((state) => state.user.id)
  const router = useRouter()
  const playRequested = router.query[PLAY_PARAM] === '1'

  const playRef = useRef(play)
  playRef.current = play

  useEffect(() => {
    if (!router.isReady || !playRequested || !userId || !ready) return

    const { [PLAY_PARAM]: _, ...query } = router.query

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
    playRef.current()
  }, [router, playRequested, userId, ready])

  const requestPlay = () => (userId ? playRef.current() : setAuthModalOpen(true))

  const authModalProps = {
    isOpen: authModalOpen,
    closeModal: () => setAuthModalOpen(false),
    callbackUrl: withPlayParam(router.asPath),
    onSuccess: () => playRef.current(),
  }

  return { requestPlay, authModalProps }
}

export default useSignInToPlay
