import { AuthScreen } from '@components/AuthScreen'
import { Meta } from '@components/Meta'
import { PageType } from '@types'

const RegisterPage: PageType = () => {
  return (
    <>
      <Meta title="Sign Up" />
      <AuthScreen mode="signup" />
    </>
  )
}

RegisterPage.noLayout = true

export default RegisterPage
