import bcrypt from 'bcryptjs'
import Cryptr from 'cryptr'
import { Document } from 'mongodb'
import NextAuth, { NextAuthOptions } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import CredentialProvider from 'next-auth/providers/credentials'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import findOrCreateOAuthUser from '@backend/routes/auth/findOrCreateOAuthUser'
import { collections, dbConnect } from '@backend/utils'
import createAppleClientSecret from '@backend/utils/createAppleClientSecret'

const cryptr = new Cryptr(process.env.CRYPTR_SECRET as string)

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  APPLE_CLIENT_ID,
  APPLE_TEAM_ID,
  APPLE_KEY_ID,
  APPLE_PRIVATE_KEY,
} = process.env

const appleEnabled = !!(APPLE_CLIENT_ID && APPLE_TEAM_ID && APPLE_KEY_ID && APPLE_PRIVATE_KEY)

// What the session carries about the user, whichever way they signed in
const toSessionUser = (user: Document) => ({
  id: user._id,
  email: user.email || '',
  name: user.name,
  avatar: user.avatar,
  bio: user.bio,
  isAdmin: user.isAdmin,
  distanceUnit: user.distanceUnit,
  mapsAPIKey: user.mapsAPIKey ? cryptr.decrypt(user.mapsAPIKey) : '',
})

const PROVIDER_NAMES: Record<string, string> = { google: 'Google', apple: 'Apple', facebook: 'Facebook' }

// Google and Apple say whether the email is verified; Facebook only shares confirmed emails
const isEmailVerified = (provider: string, profile: any) => {
  if (provider === 'facebook') return !!profile?.email
  return profile?.email_verified === true || profile?.email_verified === 'true'
}

// Only Google/Apple/Facebook buttons whose keys are configured are offered
const oauthProviders = [
  ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? [GoogleProvider({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET })]
    : []),
  ...(appleEnabled
    ? [
        AppleProvider({
          clientId: APPLE_CLIENT_ID as string,
          // a getter, so the signed secret is renewed while the server keeps running
          get clientSecret() {
            return appleClientSecret()
          },
        } as any),
      ]
    : []),
  ...(FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET
    ? [
        FacebookProvider({
          clientId: FACEBOOK_CLIENT_ID,
          clientSecret: FACEBOOK_CLIENT_SECRET,
          authorization: 'https://www.facebook.com/v19.0/dialog/oauth?scope=email',
          token: 'https://graph.facebook.com/v19.0/oauth/access_token',
          userinfo: { url: 'https://graph.facebook.com/v19.0/me' },
        } as any),
      ]
    : []),
]

const appleClientSecret = appleEnabled
  ? createAppleClientSecret({
      teamId: APPLE_TEAM_ID as string,
      keyId: APPLE_KEY_ID as string,
      clientId: APPLE_CLIENT_ID as string,
      privateKey: APPLE_PRIVATE_KEY as string,
    })
  : () => ''

// Apple returns to the site with a cross-site POST, which drops SameSite=Lax cookies; the one-time
// sign-in cookies have to be SameSite=None for its callback to work (only possible over https)
const secureSite = process.env.NEXTAUTH_URL?.startsWith('https://')
const crossSiteCookie = (name: string, maxAge?: number) => ({
  name: `__Secure-next-auth.${name}`,
  options: { httpOnly: true, sameSite: 'none', path: '/', secure: true, ...(maxAge && { maxAge }) },
})

export const authOptions: NextAuthOptions = {
  providers: [
    ...oauthProviders,
    CredentialProvider({
      type: 'credentials',
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'johndoe@test.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials, req) => {
        await dbConnect()
        const user = await collections.users?.findOne({ email: credentials?.email })

        if (!user) {
          throw new Error('Incorrect email or password')
        }

        // Accounts created with Google/Apple/Facebook have no password until the user sets one
        if (!user.password) {
          const providers = (user.oauthAccounts || []).map((a: { provider: string }) => PROVIDER_NAMES[a.provider])
          const via = providers.length ? providers.join(' or ') : 'a social account'

          throw new Error(`This account signs in with ${via}. Use that button, or reset your password to add one.`)
        }

        const passwordsMatch = await bcrypt.compare(credentials?.password || '', user.password)

        if (!passwordsMatch) {
          throw new Error('Incorrect email or password')
        }

        if (req.headers?.host === 'www.geohub.gg') {
          await collections.users?.findOneAndUpdate({ _id: user._id }, { $set: { onNewDomain: true } })
        }

        return toSessionUser(user)
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account, profile }) => {
      // first time jwt callback is run, user object is available
      if (user && account && account.provider !== 'credentials') {
        await dbConnect()

        const dbUser = await findOrCreateOAuthUser({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email: user.email,
          emailVerified: isEmailVerified(account.provider, profile),
          name: user.name,
        })

        token.user = toSessionUser(dbUser)
      } else if (user) {
        token.user = user
      }

      return token
    },
    session: async ({ session, token }) => {
      session.user = token.user as any

      return session
    },
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  ...(appleEnabled &&
    secureSite && {
      cookies: {
        pkceCodeVerifier: crossSiteCookie('pkce.code_verifier', 60 * 15),
        state: crossSiteCookie('state', 60 * 15),
        callbackUrl: crossSiteCookie('callback-url'),
      } as NextAuthOptions['cookies'],
    }),
  pages: {
    signIn: '/login',
    newUser: '/register',
    signOut: '/',
    // failed Google/Apple/Facebook sign-ins land back on the login page with ?error=
    error: '/login',
  },
}

export default NextAuth(authOptions)
