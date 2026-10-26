import { getSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, FormEvent, useEffect, useState } from 'react'
import { Button, Input } from '@components/system'
import { ArrowLeftIcon, ExclamationCircleIcon, MailIcon } from '@heroicons/react/outline'
import { useAppDispatch } from '@redux/hook'
import { updateUser } from '@redux/slices'
import { mailman, sessionToUser } from '@utils/helpers'
import { StyledAuthPanel } from './'
import ProviderIcon from './ProviderIcon'
import useAuthProviders, { SocialProvider } from './useAuthProviders'

export type AuthMode = 'login' | 'signup'
type Method = SocialProvider | 'email'

type Props = {
  initialMode: AuthMode
  // where to land after signing in (Google/Apple/Facebook always come back through a redirect)
  callbackUrl: string
  // email sign-in inside a modal: carry on in place instead of navigating
  onSuccess?: () => void
  onModeChange?: (mode: AuthMode) => void
  heading?: string
  subheading?: string
  error?: string
}

const PROVIDER_LABELS: Record<SocialProvider, string> = { google: 'Google', apple: 'Apple', facebook: 'Facebook' }
const LAST_METHOD_KEY = 'geohub:lastSignInMethod'
const EMAIL_REGEX = /\S+@\S+\.\S+/

const COPY = {
  signup: {
    heading: 'Create your free account',
    subheading: 'Save your scores, climb the leaderboards and challenge friends.',
    submit: 'Create account',
    switchPrompt: 'Already have an account?',
    switchAction: 'Log in',
  },
  login: {
    heading: 'Welcome back',
    subheading: 'Log in to keep playing.',
    submit: 'Log in',
    switchPrompt: 'New to GeoHub?',
    switchAction: 'Create an account',
  },
}

// storage can be unavailable (private mode, blocked cookies), which must never break signing in
const readLastMethod = () => {
  try {
    return localStorage.getItem(LAST_METHOD_KEY) as Method | null
  } catch {
    return null
  }
}

const rememberMethod = (method: Method) => {
  try {
    localStorage.setItem(LAST_METHOD_KEY, method)
  } catch {}
}

const AuthPanel: FC<Props> = ({ initialMode, callbackUrl, onSuccess, onModeChange, heading, subheading, error }) => {
  const [mode, setMode] = useState(initialMode)
  const [emailOpen, setEmailOpen] = useState(false)
  const [lastMethod, setLastMethod] = useState<Method | null>(null)
  const [pending, setPending] = useState<Method | null>(null)
  const [errorMessage, setErrorMessage] = useState(error || '')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const providers = useAuthProviders()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const copy = COPY[mode]

  // with no social providers configured, email is the only way in, so skip the extra click
  const showEmailForm = emailOpen || providers?.length === 0

  // once, on open: localStorage only exists in the browser
  useEffect(() => {
    const method = readLastMethod()

    setLastMethod(method)

    // returning email users go straight to the form
    if (method === 'email' && initialMode === 'login') {
      setEmailOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // coming back from Google/Apple/Facebook with the browser's back button restores this page
  // from cache, still showing "Connecting…"
  useEffect(() => {
    const resetPending = (e: PageTransitionEvent) => e.persisted && setPending(null)

    window.addEventListener('pageshow', resetPending)

    return () => window.removeEventListener('pageshow', resetPending)
  }, [])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    setErrorMessage(error || '')
  }, [error])

  const switchMode = () => {
    const nextMode = mode === 'login' ? 'signup' : 'login'

    setMode(nextMode)
    setErrorMessage('')
    onModeChange?.(nextMode)
  }

  const handleProvider = (provider: SocialProvider) => {
    setPending(provider)
    setErrorMessage('')
    rememberMethod(provider)
    signIn(provider, { callbackUrl })
  }

  const finishEmailSignIn = async () => {
    const session = await getSession()

    if (session?.user) {
      dispatch(updateUser(sessionToUser(session.user)))
    }

    rememberMethod('email')

    if (onSuccess) {
      setPending(null)
      return onSuccess()
    }

    router.replace(callbackUrl)
  }

  const validate = () => {
    if (mode === 'signup' && !name.trim()) return 'Choose a display name'
    if (!EMAIL_REGEX.test(email)) return 'Enter a valid email address'
    if (!password) return 'Enter your password'
    if (mode === 'signup' && password.length < 6) return 'Your password needs at least 6 characters'

    return ''
  }

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const problem = validate()

    if (problem) {
      return setErrorMessage(problem)
    }

    setErrorMessage('')
    setPending('email')

    if (mode === 'signup') {
      const res = await mailman('users/register', 'POST', JSON.stringify({ name: name.trim(), email, password }))

      if (!res || res.error) {
        setPending(null)
        return setErrorMessage(res?.error?.message || 'Something went wrong, please try again')
      }
    }

    const res = await signIn('credentials', { redirect: false, email, password })

    if (!res || res.error) {
      setPending(null)
      return setErrorMessage(res?.error || 'Something went wrong, please try again')
    }

    await finishEmailSignIn()
  }

  return (
    <StyledAuthPanel>
      <div className="auth-header">
        <h1 className="auth-heading">{heading || copy.heading}</h1>
        <p className="auth-subheading">{subheading || copy.subheading}</p>
      </div>

      {errorMessage && (
        <div className="auth-error" role="alert">
          <ExclamationCircleIcon />
          <span>{errorMessage}</span>
        </div>
      )}

      {!showEmailForm ? (
        <div className="auth-methods">
          {providers === null
            ? [0, 1, 2].map((idx) => <div key={idx} className="method-skeleton" />)
            : providers.map((provider) => (
                <button
                  key={provider}
                  type="button"
                  className={`method-button method-${provider}`}
                  onClick={() => handleProvider(provider)}
                  disabled={!!pending}
                  aria-busy={pending === provider}
                >
                  <span className="method-icon">
                    <ProviderIcon provider={provider} />
                  </span>
                  <span className="method-label">
                    {pending === provider ? 'Connecting…' : `Continue with ${PROVIDER_LABELS[provider]}`}
                  </span>
                  {lastMethod === provider && <span className="last-used">Last used</span>}
                </button>
              ))}

          <button
            type="button"
            className="method-button method-email"
            onClick={() => {
              setEmailOpen(true)
              setErrorMessage('')
            }}
            disabled={!!pending}
          >
            <span className="method-icon">
              <MailIcon />
            </span>
            <span className="method-label">Continue with Email</span>
            {lastMethod === 'email' && <span className="last-used">Last used</span>}
          </button>
        </div>
      ) : (
        <form className="email-form" onSubmit={handleEmailSubmit} noValidate>
          {!!providers?.length && (
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setEmailOpen(false)
                setErrorMessage('')
              }}
            >
              <ArrowLeftIcon />
              <span>Other ways to {mode === 'login' ? 'log in' : 'sign up'}</span>
            </button>
          )}

          <div className="fields">
            {mode === 'signup' && (
              <div className="field">
                <Input
                  id="auth-name"
                  type="text"
                  label="Display name"
                  value={name}
                  callback={setName}
                  autoComplete="nickname"
                  maxLength={30}
                  autoFocus
                />
                <span className="field-hint">Shown on leaderboards. You can change it later.</span>
              </div>
            )}

            <Input
              id="auth-email"
              type="email"
              label="Email address"
              value={email}
              callback={setEmail}
              autoComplete="email"
              autoFocus={mode === 'login'}
            />

            <div className="field">
              <Input
                id="auth-password"
                type="password"
                label="Password"
                value={password}
                callback={setPassword}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              {mode === 'signup' ? (
                <span className="field-hint">At least 6 characters.</span>
              ) : (
                <Link href="/forgot">
                  <a className="forgot-link">Forgot password?</a>
                </Link>
              )}
            </div>
          </div>

          <Button className="submit-button" width="100%" height="48px" isLoading={pending === 'email'}>
            {copy.submit}
          </Button>
        </form>
      )}

      <p className="switch-mode">
        {copy.switchPrompt}
        <button type="button" onClick={switchMode}>
          {copy.switchAction}
        </button>
      </p>
    </StyledAuthPanel>
  )
}

export default AuthPanel
