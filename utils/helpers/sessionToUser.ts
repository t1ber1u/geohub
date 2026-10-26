import { Session } from 'next-auth'
import { UserType } from '@types'

// The fields the redux user store keeps from a next-auth session
const sessionToUser = (sessionUser: Session['user']): UserType => ({
  id: sessionUser.id,
  name: sessionUser.name || '',
  email: sessionUser.email || '',
  avatar: sessionUser.avatar,
  bio: sessionUser.bio,
  isAdmin: sessionUser.isAdmin,
  distanceUnit: sessionUser.distanceUnit,
  mapsAPIKey: sessionUser.mapsAPIKey,
})

export default sessionToUser
