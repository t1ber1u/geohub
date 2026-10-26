import styled from 'styled-components'

const StyledAuthPanel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: var(--color2);

  .auth-header {
    text-align: center;

    .auth-heading {
      font-size: 22px;
      font-weight: 600;
      color: var(--color1);
      line-height: 1.25;
    }

    .auth-subheading {
      margin-top: 8px;
      font-size: 15px;
      line-height: 1.45;
      color: var(--color4);
    }
  }

  .auth-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #fca5a5;
    font-size: 14px;
    line-height: 1.4;

    svg {
      flex-shrink: 0;
      height: 20px;
      margin-top: -1px;
    }
  }

  .auth-methods {
    display: grid;
    gap: 12px;
  }

  // every method is the same quiet button with the brand mark, so none of them shouts louder
  .method-button {
    position: relative;
    width: 100%;
    min-height: 50px;
    padding: 0 16px 0 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background-color: var(--background2);
    border: 1px solid #333538;
    color: var(--color1);
    font-size: 15px;
    font-weight: 600;
    transition:
      background-color 150ms,
      border-color 150ms;

    &:hover:not(:disabled) {
      background-color: var(--background3);
      border-color: #45484c;
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--mediumPurple);
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }

    &[aria-busy='true'] {
      opacity: 1;
    }

    .method-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;

      svg {
        height: 20px;
        width: 20px;
      }
    }

    &.method-email .method-icon svg {
      color: var(--color3);
    }

    .last-used {
      position: absolute;
      top: -9px;
      right: 12px;
      padding: 2px 8px;
      border-radius: 999px;
      background-color: var(--indigo-600, #4f46e5);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      line-height: 16px;
    }
  }

  .method-skeleton {
    height: 50px;
    border-radius: 12px;
    background-color: var(--background2);
    border: 1px solid #26282a;
  }

  .email-form {
    display: flex;
    flex-direction: column;
    gap: 22px;

    .back-button {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 2px;
      background: none;
      color: var(--color4);
      font-size: 14px;

      svg {
        height: 16px;
      }

      &:hover {
        color: var(--color1);
      }
    }

    .fields {
      display: grid;
      gap: 20px;
    }

    // taller inputs are easier to hit on a phone
    .input-wrapper {
      height: 46px;
    }

    .field-hint {
      display: block;
      margin-top: 6px;
      font-size: 13px;
      color: var(--color5);
    }

    .forgot-link {
      display: inline-block;
      margin-top: 10px;
      font-size: 13px;
      color: var(--indigo-400);
    }
  }

  .switch-mode {
    text-align: center;
    font-size: 14px;
    color: var(--color4);

    button {
      margin-left: 6px;
      padding: 4px 2px;
      background: none;
      color: var(--indigo-400);
      font-size: 14px;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`

export default StyledAuthPanel
