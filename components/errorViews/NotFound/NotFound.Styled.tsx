import styled from 'styled-components'

type StyledProps = {}

const StyledNotFound = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin-top: calc(-1 * var(--navbarHeight));
  padding: 0 1rem;

  .no-results-container {
    max-width: 450px;
    display: flex;
    flex-direction: column;
    align-items: center;
    user-select: none;

    img {
      filter: grayscale(0.85);
    }

    h2 {
      font-size: 20px;
      color: #dadada;
      font-weight: 500;
      line-height: 35px;
      text-align: center;
      margin-top: 8px;
    }

    h3 {
      margin-top: 10px;
      color: #6a6a6a;
      font-size: 16px;
      font-weight: 400;
      text-align: center;
      line-height: 23px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 24px;
      user-select: auto;

      a {
        padding: 11px 20px;
        border-radius: 10px;
        background-color: var(--background3);
        border: 1px solid #333538;
        color: var(--color2);
        font-size: 15px;
        font-weight: 500;

        &.primary {
          background-color: var(--indigo-600);
          border-color: var(--indigo-600);
          color: #fff;
        }
      }
    }
  }
`

export default StyledNotFound
