import { getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'

export type SocialProvider = 'google' | 'apple' | 'facebook'

const ORDER: SocialProvider[] = ['google', 'apple', 'facebook']

let request: Promise<SocialProvider[]> | null = null

// The social providers the server has keys for, fetched once per page load
const loadProviders = () =>
  (request ??= getProviders()
    .then((providers) => ORDER.filter((id) => providers?.[id]))
    .catch(() => {
      request = null
      return []
    }))

// null while loading
const useAuthProviders = () => {
  const [providers, setProviders] = useState<SocialProvider[] | null>(null)

  useEffect(() => {
    let active = true

    loadProviders().then((list) => active && setProviders(list))

    return () => {
      active = false
    }
  }, [])

  return providers
}

export default useAuthProviders
