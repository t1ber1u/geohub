import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import { UserMenu } from '@components/dropdowns/UserMenu'
import { Button, Searchbar } from '@components/system'
import { SearchIcon } from '@heroicons/react/outline'
import { getAuthPageUrl } from '@utils/helpers'
import { useAppSelector } from '../../../redux-utils'
import { AppLogo } from '../../AppLogo'
import { StyledNavbar } from './'

const Navbar: FC = () => {
  const { data: session } = useSession()
  const user = useAppSelector((state) => state.user)
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <StyledNavbar>
      {searchOpen && (
        <>
          <Searchbar autoFocus onClickOutside={() => setSearchOpen(false)} />
          <span className="cancelSearch" onClick={() => setSearchOpen(false)}>
            Cancel
          </span>
        </>
      )}

      {!searchOpen && (
        <>
          <div className="leftContainer">
            <AppLogo />
          </div>

          <div className="middleContainer">
            <Searchbar />
          </div>

          <div className="rightContainer">
            <div className="rightWrapper">
              <button className="mobile-search" onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </button>

              {session && user.id ? (
                // on desktop the account menu lives in the sidebar footer; the sidebar is hidden on mobile
                <div className="navbar-user-menu">
                  <UserMenu variant="navbar" />
                </div>
              ) : (
                <>
                  <Link href={getAuthPageUrl('login', router.asPath)}>
                    <a>
                      <Button variant="solidCustom" size="sm" backgroundColor="#3d3d3d" color="#fff" hoverColor="#444">
                        Log In
                      </Button>
                    </a>
                  </Link>

                  <Link href={getAuthPageUrl('register', router.asPath)}>
                    <a>
                      <Button size="sm">Sign Up</Button>
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </StyledNavbar>
  )
}

export default Navbar
