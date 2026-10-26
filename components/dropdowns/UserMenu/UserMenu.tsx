import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { Avatar } from '@components/system'
import { ChartBarIcon, CogIcon, LogoutIcon, SelectorIcon, UserIcon } from '@heroicons/react/outline'
import { Content, Item, Label, Portal, Root, Separator, Trigger } from '@radix-ui/react-dropdown-menu'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { logOutUser } from '@redux/slices'
import { StyledUserMenu } from './'

type Props = {
  variant: 'sidebar' | 'navbar'
}

const UserMenu: FC<Props> = ({ variant }) => {
  const user = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const { asPath } = useRouter()

  // next/link prevents the click's default, so Radix never sees the select; close on navigation instead
  useEffect(() => {
    setOpen(false)
  }, [asPath])

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
    dispatch(logOutUser())
  }

  return (
    <StyledUserMenu>
      <Root open={open} onOpenChange={setOpen} modal={false}>
        <Trigger asChild>
          <button className={`trigger trigger-${variant}`} aria-label="Account menu">
            <Avatar type="user" src={user.avatar.emoji} backgroundColor={user.avatar.color} size={32} />
            <span className="trigger-name">{user.name}</span>
            {variant === 'sidebar' && <SelectorIcon className="trigger-icon" />}
          </button>
        </Trigger>

        <Portal>
          <StyledUserMenu>
            <Content
              className="user-menu-content"
              side={variant === 'sidebar' ? 'top' : 'bottom'}
              align={variant === 'sidebar' ? 'start' : 'end'}
              sideOffset={8}
              collisionPadding={8}
            >
              <Label className="user-menu-header">
                <Avatar type="user" src={user.avatar.emoji} backgroundColor={user.avatar.color} size={40} />
                <div className="user-menu-details">
                  <span className="user-menu-name">{user.name}</span>
                  {user.email && <span className="user-menu-email">{user.email}</span>}
                </div>
              </Label>

              <Separator className="user-menu-separator" />

              <Link href={`/user/${user.id}`} passHref>
                <Item asChild>
                  <a className="user-menu-item">
                    <UserIcon />
                    Your profile
                  </a>
                </Item>
              </Link>

              <Link href="/user/settings" passHref>
                <Item asChild>
                  <a className="user-menu-item">
                    <CogIcon />
                    Settings
                  </a>
                </Item>
              </Link>

              {user.isAdmin && (
                <Link href="/admin/analytics" passHref>
                  <Item asChild>
                    <a className="user-menu-item">
                      <ChartBarIcon />
                      Analytics
                    </a>
                  </Item>
                </Link>
              )}

              <Separator className="user-menu-separator" />

              <Item className="user-menu-item destructive" onSelect={handleLogout}>
                <LogoutIcon />
                Log out
              </Item>
            </Content>
          </StyledUserMenu>
        </Portal>
      </Root>
    </StyledUserMenu>
  )
}

export default UserMenu
