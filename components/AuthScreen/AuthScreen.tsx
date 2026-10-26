import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FC, useEffect, useRef } from 'react'
import { AppLogo } from '@components/AppLogo'
import { AuthMode, AuthPanel } from '@components/AuthPanel'
import StyledAuthPage from '@styles/AuthPage.Styled'
import { getSafeCallbackUrl } from '@utils/helpers'

// next-auth sends failed Google/Apple/Facebook sign-ins back here with ?error=<code>
const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: 'Sign-in was cancelled. Pick a way to continue.',
  OAuthSignin: "We couldn't start signing you in. Please try again.",
  OAuthCallback: "Signing in didn't finish. Please try again.",
  Callback: "We couldn't set up your account. Please try again.",
  Default: 'Something went wrong while signing you in. Please try again.',
}

type Props = {
  mode: AuthMode
}

// The /login and /register pages: the same panel, starting on a different mode
const AuthScreen: FC<Props> = ({ mode }) => {
  const router = useRouter()
  const { status } = useSession()
  const callbackUrl = getSafeCallbackUrl(router.query.callbackUrl ?? router.query.callback)
  const errorCode = typeof router.query.error === 'string' ? router.query.error : ''

  const redirecting = useRef(false)

  // one redirect only: a second one started while the first is loading cancels it
  const goToCallback = () => {
    if (redirecting.current) return

    redirecting.current = true
    router.replace(callbackUrl)
  }

  // already signed in (e.g. opened /login in a new tab)
  useEffect(() => {
    if (status === 'authenticated') {
      goToCallback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleModeChange = (nextMode: AuthMode) => {
    router.replace({
      pathname: nextMode === 'login' ? '/login' : '/register',
      query: callbackUrl !== '/' ? { callbackUrl } : {},
    })
  }

  return (
    <StyledAuthPage>
      <div className="logoWrapper">
        <AppLogo />
      </div>

      <section className="authContainer panelContainer">
        <AuthPanel
          initialMode={mode}
          callbackUrl={callbackUrl}
          onSuccess={goToCallback}
          onModeChange={handleModeChange}
          error={errorCode ? ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default : ''}
        />
      </section>
    </StyledAuthPage>
  )
}

export default AuthScreen
