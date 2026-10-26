import { ObjectId } from 'mongodb'

type User = {
  id: ObjectId
  name: string
  bio?: string
  email?: string
  password?: string // absent for accounts created with Google/Apple/Facebook
  oauthAccounts?: { provider: string; providerAccountId: string }[]
  avatar: { emoji: string; color: string }
  createdAt?: Date
  isAdmin?: boolean
}

export default User
