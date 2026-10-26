import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const StyledUserMenu = styled.div`
  .trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: transparent;
    border-radius: 6px;
    color: #bec3c9;
    user-select: none;
    min-width: 0;

    &:hover,
    &[data-state='open'] {
      background-color: #2a2a2f;
      color: var(--color2);
    }

    &:focus-visible {
      outline: 2px solid var(--indigo-600);
    }
  }

  .trigger-name {
    flex: 1;
    min-width: 0;
    text-align: left;
    font-size: 14px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trigger-icon {
    height: 18px;
    flex-shrink: 0;
    color: #666;
  }

  .trigger-sidebar {
    width: 100%;
    padding: 6px;

    @media (max-width: 1200px) {
      justify-content: center;

      .trigger-name,
      .trigger-icon {
        display: none;
      }
    }
  }

  .trigger-navbar {
    padding: 4px;

    .trigger-name {
      font-size: 16px;
      max-width: 250px;

      @media (max-width: 500px) {
        display: none;
      }
    }
  }

  .user-menu-content {
    min-width: 230px;
    max-width: 280px;
    background-color: #2b2b2e;
    border-radius: 8px;
    padding: 5px;
    box-shadow: 0 0 0 1px #3d3d42, 0 10px 30px rgba(0, 0, 0, 0.5);
    z-index: 99;
    animation: ${fadeIn} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .user-menu-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
  }

  .user-menu-details {
    display: grid;
    min-width: 0;
  }

  .user-menu-name,
  .user-menu-email {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-menu-name {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }

  .user-menu-email {
    color: #8b8f93;
    font-size: 12px;
    font-weight: 400;
  }

  .user-menu-separator {
    height: 1px;
    background-color: #3d3d42;
    margin: 5px;
  }

  .user-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 36px;
    padding: 0 10px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 400;
    color: #dcdcdc;
    cursor: pointer;
    user-select: none;
    outline: none;

    svg {
      height: 18px;
      color: #8b8f93;
    }

    &[data-highlighted] {
      background-color: #3a3a40;
      color: #fff;

      svg {
        color: #dcdcdc;
      }
    }

    &.destructive[data-highlighted] {
      background-color: #b02828;

      svg {
        color: #fff;
      }
    }

    @media (max-width: 600px) {
      height: 44px;
      font-size: 15px;
    }
  }
`

export default StyledUserMenu
