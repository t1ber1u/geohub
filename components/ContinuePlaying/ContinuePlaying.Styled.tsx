import styled from 'styled-components'

const StyledContinuePlaying = styled.section`
  display: grid;
  gap: 12px;
  // the home page pulls its content up over the hero image; stay above it like the map cards do
  z-index: 1;

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color1);
  }

  .see-all {
    font-size: 14px;
    color: var(--indigo-400);

    &:hover {
      text-decoration: underline;
    }
  }
`

export default StyledContinuePlaying
