import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const StyledGuessMapSearch = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  max-width: 360px;
  z-index: 2;

  @media (max-width: 600px) {
    /* leave room for the close-map button in the top right corner */
    right: 52px;
    max-width: none;
  }

  .searchInputWrapper {
    display: flex;
    align-items: center;
    height: 38px;
    border-radius: 6px;
    background-color: ${({ theme }) => theme.color.gray[800]};
    border: 1px solid ${({ theme }) => theme.color.gray[700]};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
    transition: box-shadow 100ms;

    &:focus-within {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.color.brand}, 0 2px 8px rgba(0, 0, 0, 0.45);
    }

    @media (max-width: 600px) {
      height: 40px;
    }
  }

  .searchIcon {
    height: 18px;
    width: 18px;
    flex-shrink: 0;
    margin-left: 10px;
    color: ${({ theme }) => theme.color.gray[500]};
  }

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 8px;
    background: transparent;
    color: #d1d1d1;
    font-size: 14px;

    ::placeholder {
      color: ${({ theme }) => theme.color.gray[600]};
    }

    @media (max-width: 600px) {
      /* 16px stops iOS Safari from zooming the page on focus */
      font-size: 16px;
    }
  }

  .clearBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 10px;
    flex-shrink: 0;
    background: transparent;
    border-radius: 0 6px 6px 0;

    svg {
      height: 16px;
      width: 16px;
      color: ${({ theme }) => theme.color.gray[500]};
    }

    &:hover svg {
      color: #d1d1d1;
    }
  }

  .spinner {
    height: 14px;
    width: 14px;
    margin: 0 12px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.color.gray[600]};
    border-top-color: #d1d1d1;
    animation: ${spin} 0.7s linear infinite;
  }

  .results {
    margin-top: 6px;
    padding: 4px;
    max-height: min(320px, 40vh);
    overflow-y: auto;
    border-radius: 6px;
    background-color: ${({ theme }) => theme.color.gray[800]};
    border: 1px solid ${({ theme }) => theme.color.gray[700]};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  }

  .result {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 4px;
    cursor: pointer;

    &.active {
      background-color: ${({ theme }) => theme.color.gray[700]};
    }

    @media (max-width: 600px) {
      /* comfortable touch targets */
      min-height: 48px;
    }
  }

  .resultText {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .resultName,
  .resultDetail {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .resultName {
    color: #e5e5e5;
    font-size: 14px;
    font-weight: 500;
  }

  .resultDetail {
    color: ${({ theme }) => theme.color.gray[500]};
    font-size: 12px;
  }

  .resultType {
    flex-shrink: 0;
    font-size: 11px;
    color: ${({ theme }) => theme.color.gray[400]};
    background-color: ${({ theme }) => theme.color.gray[900]};
    padding: 2px 6px;
    border-radius: 4px;
  }

  .noResults {
    padding: 10px;
    font-size: 13px;
    color: ${({ theme }) => theme.color.gray[500]};
  }
`

export default StyledGuessMapSearch
