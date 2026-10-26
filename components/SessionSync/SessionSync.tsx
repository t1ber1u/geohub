import { useSession } from 'next-auth/react'
import { FC, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { logOutUser, updateUser } from '@redux/slices'
import { sessionToUser } from '@utils/helpers'

// Keeps the stored user in step with the next-auth session on every page, so signing in with
// Google/Apple/Facebook (which returns through a redirect) or an expired session is picked up anywhere
const SessionSync: FC = () => {
  const { data: session, status } = useSession()
  const userId = useAppSelector((state) => state.user.id)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (status === 'authenticated' && session.user?.id && session.user.id !== userId) {
      dispatch(updateUser(sessionToUser(session.user)))
    }

    if (status === 'unauthenticated' && userId) {
      dispatch(logOutUser())
    }
  }, [status, session?.user, userId, dispatch])

  return null
}

export default SessionSync
