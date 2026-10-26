// /login or /register that returns the user to the page they were on
const getAuthPageUrl = (page: 'login' | 'register', returnTo: string) => {
  const isAuthPage = /^\/(login|register)(\?|$)/.test(returnTo)

  return returnTo === '/' || isAuthPage ? `/${page}` : `/${page}?callbackUrl=${encodeURIComponent(returnTo)}`
}

export default getAuthPageUrl
