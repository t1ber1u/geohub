import styled from 'styled-components'

const StyledMapRankings = styled.div`
  background-color: var(--background2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;

  @media (max-width: 600px) {
    border-radius: 0;
    border: none;
    background-color: transparent;
  }

  .rankings-header {
    display: grid;
    gap: 14px;
    padding: 20px 20px 16px;
    border-bottom: var(--border);

    @media (max-width: 1000px) {
      padding: 16px;
    }
  }

  .title-row,
  .rules-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .title {
    font-size: 1.125rem;

    @media (max-width: 1000px) {
      font-size: 1rem;
    }
  }

  .segmented {
    display: flex;
    background-color: #111;
    border: var(--border);
    border-radius: 6px;
    padding: 3px;

    button {
      height: 30px;
      padding: 0 12px;
      border-radius: 4px;
      background: transparent;
      color: var(--color4);
      font-size: 14px;
      font-weight: 400;
      white-space: nowrap;

      &:hover {
        color: var(--color2);
      }

      &.active {
        background-color: #2c2c30;
        color: #fff;
      }
    }
  }

  .chips {
    display: flex;
    gap: 8px;

    button {
      height: 30px;
      padding: 0 12px;
      border-radius: 15px;
      border: var(--border);
      background: transparent;
      color: var(--color4);
      font-size: 13px;
      font-weight: 400;

      &:hover {
        color: var(--color2);
        border-color: #444;
      }

      &.active {
        background-color: var(--indigo-700);
        border-color: var(--indigo-500);
        color: #fff;
      }
    }
  }

  .players-count {
    color: var(--color4);
    font-size: 13px;
    font-weight: 400;
  }

  .rankings-body {
    transition: opacity 0.15s;

    &.loading {
      opacity: 0.5;
    }
  }

  .ranking-row {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) 150px 48px 90px 24px;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;

    &:not(:first-child) {
      border-top: var(--border);
    }

    &.is-me {
      background-color: rgba(99, 102, 241, 0.1);
      box-shadow: inset 3px 0 0 var(--indigo-500);
    }

    @media (max-width: 1000px) {
      padding: 12px 16px;
    }

    @media (max-width: 700px) {
      grid-template-columns: 28px minmax(0, 1fr) auto 40px 20px;
      gap: 10px;

      .time {
        display: none;
      }
    }
  }

  .rank {
    font-feature-settings: 'tnum';
    font-weight: 500;
    color: var(--color3);
    text-align: center;

    &.podium {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      width: 28px;
      border-radius: 50%;
      color: #111;
      font-size: 14px;
      font-weight: 700;
    }

    &.podium-1 {
      background: linear-gradient(135deg, #fde68a, #f59e0b);
    }

    &.podium-2 {
      background: linear-gradient(135deg, #f1f5f9, #94a3b8);
    }

    &.podium-3 {
      background: linear-gradient(135deg, #fed7aa, #c2410c);
    }
  }

  .player {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .player-details {
    display: grid;
    min-width: 0;
  }

  .player-name {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--color2);
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: #fff;
    }
  }

  .you-tag {
    flex-shrink: 0;
    padding: 1px 6px;
    border-radius: 4px;
    background-color: var(--indigo-700);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .player-meta {
    color: var(--color4);
    font-size: 12px;
    font-weight: 400;
  }

  .score {
    display: grid;
    gap: 6px;
  }

  .points {
    font-feature-settings: 'tnum';
    font-size: 16px;
    font-weight: 600;
    color: #fff;
  }

  .score-bar {
    height: 4px;
    border-radius: 2px;
    background-color: #2a2a2e;
    overflow: hidden;

    div {
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, var(--indigo-500), var(--indigo-400));
    }

    @media (max-width: 700px) {
      display: none;
    }
  }

  .perfect {
    display: flex;
    align-items: center;
    gap: 4px;
    font-feature-settings: 'tnum';
    font-size: 14px;
    color: #fbbf24;

    svg {
      height: 16px;
    }

    &.none {
      color: #555;
    }
  }

  .time {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color3);
    font-size: 14px;
    font-weight: 400;
    white-space: nowrap;

    svg {
      height: 15px;
      color: var(--indigo-400);
    }
  }

  .results-link {
    display: flex;

    svg {
      height: 20px;
      color: #8a8a8a;

      path {
        stroke-width: 1.5;
      }
    }

    &:hover svg {
      color: #ddd;
    }
  }

  .gap-divider {
    height: 10px;
    border-top: var(--border);
    background-image: radial-gradient(circle, #444 1px, transparent 1.5px);
    background-size: 10px 10px;
    background-position: center;
    background-repeat: repeat-x;
  }

  .empty-message {
    display: block;
    padding: 20px;
    color: var(--color4);
    font-weight: 400;
  }

  .my-summary {
    padding: 12px 20px;
    border-top: var(--border);
    color: var(--color3);
    font-size: 14px;
    font-weight: 400;

    &:empty {
      display: none;
    }

    strong {
      color: #fff;
      font-weight: 600;
    }

    .summary-link {
      color: var(--indigo-400);
    }

    @media (max-width: 1000px) {
      padding: 12px 16px;
    }
  }

  .records {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-top: var(--border);

    @media (max-width: 700px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .record {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;

    &:not(:first-child) {
      border-left: var(--border);

      @media (max-width: 700px) {
        border-left: none;
        border-top: var(--border);
      }
    }

    @media (max-width: 1000px) {
      padding: 14px 16px;
    }
  }

  .record-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    height: 36px;
    width: 36px;
    border-radius: 8px;
    background-color: rgba(99, 102, 241, 0.15);

    svg {
      height: 20px;
      color: var(--indigo-400);
    }
  }

  .record-details {
    display: grid;
    min-width: 0;
  }

  .record-label {
    color: var(--color4);
    font-size: 12px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .record-value {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
  }

  .record-holder {
    font-size: 13px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    a {
      color: var(--color3);

      &:hover {
        color: #fff;
      }
    }
  }
`

export default StyledMapRankings
