import styled from 'styled-components'

const StyledGameExitButton = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2;

  @media (max-width: 600px) {
    top: 12px;
    left: 12px;
  }

  .exit-button {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 16px 0 14px;
    border-radius: 999px;
    background-color: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    user-select: none;

    svg {
      height: 18px;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.85);
    }

    // icon only on phones, where the top bar is crowded
    @media (max-width: 600px) {
      width: 44px;
      padding: 0;
      justify-content: center;

      .exit-label {
        display: none;
      }
    }
  }
`

export default StyledGameExitButton
