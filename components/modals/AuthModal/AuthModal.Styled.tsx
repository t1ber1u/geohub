import styled from 'styled-components'

const StyledAuthModal = styled.div`
  position: relative;
  background-color: #151515;

  .close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: var(--color4);
    padding: 6px;
    border-radius: 8px;

    &:hover {
      background-color: #222;
      color: var(--color1);
    }

    svg {
      height: 22px;
    }
  }

  .mainContent {
    padding: 40px 32px 28px;

    @media (max-width: 600px) {
      padding: 44px 20px 24px;
    }
  }
`

export default StyledAuthModal
