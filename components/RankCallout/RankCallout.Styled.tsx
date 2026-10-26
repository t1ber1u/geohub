import styled, { keyframes } from 'styled-components'

const popIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const StyledRankCallout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin: 2px 0 8px;
  animation: ${popIn} 300ms ease-out;
  text-align: center;

  .headline {
    font-size: 15px;
    font-weight: 500;
    color: var(--color2);

    &.celebrate {
      color: #fde68a;
    }
  }

  .standings {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .standing {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 50rem;
    background-color: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .standing-rank {
    color: #fff;
    font-weight: 700;
    font-feature-settings: 'tnum';
  }

  .standing-label {
    color: var(--color4);
    font-size: 13px;
    font-weight: 400;
  }

  .next-target {
    color: var(--color3);
    font-size: 13px;
    font-weight: 400;
  }

  .leaderboard-link {
    color: var(--indigo-400);
    font-size: 13px;
    font-weight: 400;

    &:hover {
      color: var(--indigo-300);
    }
  }
`

export default StyledRankCallout
