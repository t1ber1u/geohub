import { collections } from '@backend/utils'
import { NAME_MAX_LEN } from '@backend/validations/userValidations'
import { getRandomAvatar } from '@utils/helpers'

type OAuthSignIn = {
  provider: string
  providerAccountId: string
  email?: string | null
  emailVerified: boolean
  name?: string | null
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Display names are unique, so "Jane Doe" becomes "Jane Doe 4821" when it is taken
const findFreeName = async (wanted: string) => {
  const base = wanted.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX_LEN) || 'Explorer'

  if (!(await collections.users?.findOne({ name: base }))) {
    return base
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = String(1000 + Math.floor(Math.random() * 9000))
    const name = `${base.slice(0, NAME_MAX_LEN - suffix.length - 1).trim()} ${suffix}`

    if (!(await collections.users?.findOne({ name }))) {
      return name
    }
  }

  return `Explorer ${Date.now().toString().slice(-6)}`
}

// Apple's "Hide my email" relay addresses make poor display names
const nameFromEmail = (email?: string | null) => {
  if (!email || email.endsWith('privaterelay.appleid.com')) return ''

  return email.split('@')[0].replace(/[._-]+/g, ' ')
}

/**
 * Returns the GeoHub user for a Google/Apple/Facebook sign-in:
 * 1. the user already linked to this provider account,
 * 2. otherwise an existing user with the same (provider-verified) email, which gets linked,
 * 3. otherwise a brand new user.
 */
const findOrCreateOAuthUser = async ({ provider, providerAccountId, email, emailVerified, name }: OAuthSignIn) => {
  const oauthAccount = { provider, providerAccountId }

  const linkedUser = await collections.users?.findOne({ oauthAccounts: { $elemMatch: oauthAccount } })

  if (linkedUser) {
    return linkedUser
  }

  const userWithEmail = email
    ? await collections.users?.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') })
    : null

  // Only link by email when the provider has verified it, otherwise anyone could claim an account
  if (userWithEmail && emailVerified) {
    await collections.users?.updateOne({ _id: userWithEmail._id }, { $push: { oauthAccounts: oauthAccount } })
    return userWithEmail
  }

  const newUser = {
    name: await findFreeName(name || nameFromEmail(email)),
    // an unverified email that already belongs to someone else stays off the new account
    ...(email && !userWithEmail && { email: email.toLowerCase() }),
    avatar: getRandomAvatar(),
    oauthAccounts: [oauthAccount],
    createdAt: new Date(),
  }

  const { insertedId } = (await collections.users?.insertOne(newUser)) ?? {}

  if (!insertedId) {
    throw new Error('Failed to create account')
  }

  return { _id: insertedId, ...newUser }
}

export default findOrCreateOAuthUser
