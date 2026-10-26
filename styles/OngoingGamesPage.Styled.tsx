import styled from 'styled-components'

const StyledOngoingGamesPage = styled.div`
  height: 100%;
  padding-bottom: 40px;

  .page-intro {
    display: grid;
    gap: 16px;
    margin-bottom: 20px;
  }

  .intro-text {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    max-width: 720px;
    color: var(--color3);
    font-size: 15px;
    line-height: 1.5;

    svg {
      flex-shrink: 0;
      height: 20px;
      margin-top: 1px;
      color: var(--color4);
    }
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;

    .games-count {
      font-size: 14px;
      color: var(--color4);
    }

    .clear-button {
      padding: 8px 14px;
      border-radius: 8px;
      background-color: var(--background3);
      border: 1px solid #333538;
      color: var(--color2);
      font-size: 14px;
      font-weight: 500;

      &:hover {
        background-color: var(--background4);
      }
    }
  }

  .games-list {
    display: grid;
    gap: 12px;
    overflow: visible !important;
  }

  .card-skeleton {
    height: 92px;
    border-radius: 12px;
    background-color: var(--background2);
    border: 1px solid #222325;
  }

  .list-loader {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 56px 20px;
    border-radius: 14px;
    background-color: var(--background2);
    border: 1px solid #262729;

    .empty-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 56px;
      width: 56px;
      margin-bottom: 18px;
      border-radius: 50%;
      background-color: rgba(99, 102, 241, 0.14);

      svg {
        height: 28px;
        color: var(--indigo-300);
      }
    }

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--color1);
    }

    p {
      margin-top: 8px;
      max-width: 420px;
      color: var(--color4);
      font-size: 15px;
      line-height: 1.5;
    }

    .empty-action {
      margin-top: 22px;
      padding: 12px 22px;
      border-radius: 10px;
      background-color: var(--indigo-600);
      color: #fff;
      font-size: 15px;
      font-weight: 600;

      &:hover {
        background-color: var(--indigo-500);
      }
    }
  }
`

export default StyledOngoingGamesPage
