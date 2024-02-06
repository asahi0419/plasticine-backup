import styled from 'styled-components';

export default styled.div`
  position: relative;
  height: 100%;

  .view-calendar-content {
    position: relative;
    height: 100%;
    min-height: 500px;
    width: 100%;

    .react-calendar-timeline {
      border: 1px solid lightgrey;

      .search-bar-calendar {
        width: 300px;
      }

      .rct-scroll {
        width: 100% !important;
        overflow-x: hidden !important;
      }

      .rct-calendar-header {
        background-color: #fff;

        .rct-dateHeader {
          background-color: #fff;
        }

        .rct-dateHeader-primary {
          color: #000;
        }

        .rct-dateHeader:not(.rct-dateHeader-primary) {
          margin-left: -1px;
        }
      }

      .calendar-tile {
        overflow: hidden;
      }

      .calendar-tile:hover {
        overflow: auto;
        scrollbar-width: thin;
      }
    }

    .rct-vl {
      border-left: 2px solid #bbb;
    }

    .sticky {
      position: sticky;
      top: 50px;
      z-index: 200;
    }
  }

  .view-calendar-controls {
    top: 0;
    right: initial;
    margin: 6px;

    .view-calendar-control {
      display: flex;
      position: relative !important;

      .actions {
        display: flex;
      }

      .actions-right {
        display: flex;
        margin-left: auto;
      }
    }
  }
`;
