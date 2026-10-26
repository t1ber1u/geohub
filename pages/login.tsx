import { AuthScreen } from '@components/AuthScreen'
import { Meta } from '@components/Meta'
import { PageType } from '@types'

const LoginPage: PageType = () => {
  return (
    <>
      <Meta title="Log In" />
      <AuthScreen mode="login" />
    </>
  )
}

LoginPage.noLayout = true

export default LoginPage
