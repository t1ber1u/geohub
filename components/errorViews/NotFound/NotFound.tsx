import Image from 'next/image'
import { FC, ReactNode } from 'react'
import { StyledNotFound } from './'

type Props = {
  title?: string
  message?: string
  // optional ways forward, e.g. links back into the app
  actions?: ReactNode
}

const NotFound: FC<Props> = ({ title, message, actions }) => {
  return (
    <StyledNotFound>
      <div className="no-results-container">
        <Image src="/images/not-found.png" height={250} width={250} alt="Cartoon man holding a map" />

        <h2>{title || `404 - Page Not Found`}</h2>
        <h3>{message || `Hmm... this page is not on our map.`}</h3>

        {actions && <div className="actions">{actions}</div>}
      </div>
    </StyledNotFound>
  )
}

export default NotFound
