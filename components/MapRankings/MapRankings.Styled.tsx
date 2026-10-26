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
  .filters-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .title-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .title {
    font-size: 1.125rem;

    @media (max-width: 1000px) {
      font-size: 1rem;
    }
  }

  .help-button {
    display: flex;
    padding: 2px;
    border-radius: 50%;
    background: transparent;
    color: #777;

    svg {
      height: 20px;
    }

    &:hover,
    &.active {
      color: var(--indigo-400);
    }
  }

  .help-panel {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 12px 14px 12px 30px;
    border-radius: 6px;
    background-color: #111;
    border: var(--border);
    color: var(--color3);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.45;

    strong {
      color: var(--color2);
      font-weight: 600;
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

    &.small button {
      height: 26px;
      padding: 0 10px;
      font-size: 13px;
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
    margin-top: -4px;
    color: var(--color4);
    font-size: 13px;
    font-weight: 400;
  }

  .crown {
    display: inline-flex;
    flex-shrink: 0;
    color: #fbbf24;

    svg {
      height: 16px;
    }
  }

  .champion-strip {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 20px;
    border-bottom: var(--border);
    background: linear-gradient(90deg, rgba(251, 191, 36, 0.12), rgba(251, 191, 36, 0) 70%);
    font-size: 14px;
    font-weight: 400;

    .crown svg {
      height: 18px;
    }

    .champion-label {
      color: var(--color3);
    }

    .champion-name {
      color: #fde68a;
      font-weight: 600;

      &:hover {
        color: #fff;
      }
    }

    .champion-points {
      color: var(--color4);
    }

    @media (max-width: 1000px) {
      padding: 10px 16px;
    }
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

    &:hover:not(.is-me) {
      background-color: rgba(255, 255, 255, 0.02);
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

    &:hover {
      color: #fff;
    }
  }

  .player-name-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px;
    color: var(--color4);
    font-weight: 400;

    .empty-play-button {
      padding: 0 16px;
    }

    @media (max-width: 1000px) {
      padding: 16px;
    }
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

  .distribution {
    display: grid;
    gap: 12px;
    padding: 16px 20px 14px;
    border-top: var(--border);

    @media (max-width: 1000px) {
      padding: 14px 16px 12px;
    }
  }

  .distribution-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .section-title {
    color: var(--color4);
    font-size: 12px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .distribution-caption {
    color: var(--color4);
    font-size: 13px;
    font-weight: 400;
  }

  .histogram {
    padding-top: 18px;
  }

  .plot {
    position: relative;
    display: flex;
    height: 88px;
    border-bottom: 1px solid #333;
  }

  .bin {
    position: relative;
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;

    .bar {
      width: min(24px, calc(100% - 2px));
      border-radius: 4px 4px 0 0;
      background-color: #4a4a52;
    }

    &.mine .bar {
      background-color: var(--indigo-400);
    }

    &:hover .bar {
      filter: brightness(1.25);
    }

    .you-label {
      position: absolute;
      top: -18px;
      color: var(--color2);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .bin-tooltip {
      display: none;
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      padding: 6px 10px;
      border-radius: 6px;
      background-color: #2b2b2e;
      box-shadow: 0 0 0 1px #3d3d42, 0 6px 16px rgba(0, 0, 0, 0.4);
      color: var(--color3);
      font-size: 12px;
      font-weight: 400;
      white-space: nowrap;
      pointer-events: none;

      strong {
        display: block;
        color: #fff;
        font-weight: 600;
      }
    }

    &:hover .bin-tooltip {
      display: block;
    }

    &:first-child .bin-tooltip {
      left: 0;
      transform: none;
    }

    &:last-child .bin-tooltip {
      left: auto;
      right: 0;
      transform: none;
    }
  }

  .average-line {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 2px dashed var(--color4);
    pointer-events: none;

    span {
      position: absolute;
      top: -18px;
      left: 4px;
      color: var(--color4);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
  }

  .axis {
    position: relative;
    height: 18px;
    margin-top: 4px;

    span {
      position: absolute;
      transform: translateX(-50%);
      color: var(--color4);
      font-size: 11px;
      font-weight: 400;

      &:first-child {
        transform: none;
      }

      &:last-child {
        transform: translateX(-100%);
      }
    }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
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
