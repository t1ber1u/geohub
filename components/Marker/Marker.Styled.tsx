import styled from 'styled-components'

type StyledProps = {
  type: 'guess' | 'actual'
}

const StyledMarker = styled.div<StyledProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  //background-color: #000;
  border: 3px solid #fff;
  border-radius: 100%;
  transform: translate(-50%, -50%);
  //pointer-events: none !important;
  //background-color: red !important;

  // Guess marker is a pin: the tip of the pointer sits exactly on the guessed point
  ${({ type }) =>
    type === 'guess' &&
    `
      transform: translate(-50%, calc(-100% - 10px));
      filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: calc(100% + 3px);
        transform: translateX(-50%);
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 10px solid #fff;
      }
  `}

  ${({ type }) =>
    type === 'actual' &&
    `
      &:hover {
        transform: translate(-50%, -50%) scale(1.05);
      }
  `}

  .actual-marker {
    height: 24px;
    width: 24px;
    background-color: #29292e;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font: bold 14px Helvetica, Verdana, Tahoma;

    svg {
      height: 14px;
    }

    /*
    .round-number {
      height: 14px;
      width: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      color: #000;
      font-weight: bold;
      border-radius: 50%;
      position: absolute;
      bottom: -3px;
      right: -3px;
    }
    */
  }
`

export default StyledMarker
