// Where to send the user after they sign in. Only same-site paths are allowed, so a crafted
// ?callbackUrl=https://evil.example can't bounce people off the site.
const getSafeCallbackUrl = (value: unknown, fallback = '/') => {
  const url = Array.isArray(value) ? value[0] : value

  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) {
    return fallback
  }

  // never send someone back to the auth pages themselves
  return /^\/(login|register)(\?|$)/.test(url) ? fallback : url
}

export default getSafeCallbackUrl
