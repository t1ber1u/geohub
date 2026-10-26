import styled from 'styled-components'

const StyledOngoingGameCard = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  padding: 18px 20px;
  background-color: var(--background2);
  border: 1px solid #262729;
  border-radius: 12px;
  transition: border-color 150ms;

  &:hover {
    border-color: #36383b;
  }

  &.highlighted {
    border-color: var(--indigo-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.22);
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }

  .game-main {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .game-text {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .game-kind {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--color5);
  }

  .game-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--color1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .game-rules {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }

  .rule-chip {
    padding: 2px 8px;
    border-radius: 999px;
    background-color: var(--background3);
    color: var(--color3);
    font-size: 12px;
  }

  .game-progress {
    display: grid;
    gap: 8px;
    min-width: 0;
  }

  .round-track {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    max-width: 260px;

    .round-step {
      height: 6px;
      border-radius: 3px;
      background-color: var(--background4);

      &.done {
        background-color: var(--indigo-500);
      }

      &.current {
        background-color: var(--indigo-300);
        opacity: 0.55;
      }
    }
  }

  .progress-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 500;
    color: var(--color2);

    .points {
      margin-left: 6px;
      padding-left: 8px;
      border-left: 1px solid #3a3c3f;
      color: var(--color1);
      font-weight: 600;
    }

    .streak-icon {
      height: 18px;
      color: #fbbf24;
    }
  }

  .game-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
    font-size: 13px;
    color: var(--color4);

    .expiry {
      display: inline-flex;
      align-items: center;
      gap: 4px;

      svg {
        height: 15px;
      }

      &.soon {
        color: var(--amber-400);
      }

      &.urgent {
        color: var(--red-400);
        font-weight: 600;
      }
    }
  }

  .game-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 860px) {
      .continue-button {
        flex: 1;
      }
    }
  }

  .continue-button {
    // same width for "Start" and "Continue", so the columns line up from card to card
    min-width: 136px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 44px;
    padding: 0 22px;
    border-radius: 10px;
    background-color: var(--indigo-600);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    transition: background-color 150ms;

    svg {
      height: 18px;
    }

    &:hover {
      background-color: var(--indigo-500);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--mediumPurple);
    }
  }

  .remove-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 44px;
    border-radius: 10px;
    background-color: transparent;
    border: 1px solid #333538;
    color: var(--color4);
    transition:
      color 150ms,
      border-color 150ms,
      background-color 150ms;

    svg {
      height: 19px;
    }

    &:hover {
      color: var(--red-400);
      border-color: rgba(248, 113, 113, 0.4);
      background-color: rgba(248, 113, 113, 0.08);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--mediumPurple);
    }
  }
`

export default StyledOngoingGameCard
