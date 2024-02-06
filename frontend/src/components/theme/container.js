import styled from 'styled-components';
import * as CONSTANTS from '../../constants';

const themeProp = attr => ({ theme }) => theme[attr];

export default styled.div`

  //-----------------------------------------
  // Globals
  //-----------------------------------------

  width: 100%;
  height: 100%;

  *::selection {
    color: ${themeProp('mainText')};
  }

  background-color: ${themeProp('mainBackground')};
  color: ${themeProp('mainText')};

  a {
    color: ${themeProp('link')};
    &:hover {
      color: ${themeProp('linkHover')};
    }
  }

  //-----------------------------------------
  // Components
  //-----------------------------------------

  .system-sidebar {
    border-right: 1px solid ${themeProp('mainBorder')} !important;
    background-color: ${themeProp('sidebarBackground')} !important;

    .item {
      color: ${themeProp('mainText')} !important;
      &:before {
        background: ${themeProp('mainBorder')} !important;
      }
      a {
        color: ${themeProp('sidebarLink')} !important;
        &:hover {
          color: ${themeProp('sidebarLinkHover')} !important;
        }
      }
      .header .content {
        color: ${themeProp('mainText')} !important;
        &:hover {
          color: ${themeProp('mainTextHover')} !important;
        }
      }
    }

    .items-list {
      .item {
        .favorite-icon {
          color: ${themeProp('itemsListFavoriteIcon')};
          &.favorite {
            color: ${themeProp('itemsListFavoriteIconHover')};
          }
        }
      }
    }
  }

  .user-sidebar {
    border-right: 1px solid ${themeProp('mainBorder')} !important;
    background-color: ${themeProp('sidebarBackground')} !important;

    .group {
      .title {
        background-color: ${themeProp('sidebarGroupTitleBackground')};
      }
      .item {
        a {
          color: ${themeProp('sidebarGroupItem')};
          &:hover {
            color: ${themeProp('sidebarGroupItemHover')};
          }
        }
      }
    }
  }

  .view .view-header,
  .form .form-header {
    border-bottom: 1px solid ${themeProp('mainBorder')};
  }

  .form .section .columns .view-header {
    border-bottom: none;
  }

  .icon-shared {
    .map-line {
      background-color: ${themeProp('mainText')};

        &:after,
        &:before {
          border-color: ${themeProp('mainText')};
          background-color: ${themeProp('mainBackground')};
        }
    }
  }

  //-----------------------------------------
  // Shared Components
  //-----------------------------------------

  .icon-button,
  .icon-button a {
    color: ${themeProp('mainText')} !important;

    &:hover {
      color: ${themeProp('mainTextHover')} !important;
    }
  }

  .menu-trigger {
    color: ${themeProp('mainText')};

    &:hover {
      color: ${themeProp('mainTextHover')} !important;
    }
  }

  .loader-component.dimmed {
    background-color: ${themeProp('loaderDimmerBackground')};
  }

  .search-bar {
    color: ${themeProp('mainText')};
    .icon {
      color: ${themeProp('searchBarIcon')};
      &:hover {
        color: ${themeProp('searchBarIconHover')};
      }
    }
    .input {
      input {
        color: ${themeProp('mainText')};
        background-color: ${themeProp('sidebarBackground')};
        ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
          color: ${themeProp('placeholderColor')};
        }
        ::-moz-placeholder { /* Firefox 19+ */
          color: ${themeProp('placeholderColor')};
        }
        :-ms-input-placeholder { /* IE 10+ */
          color: ${themeProp('placeholderColor')};
        }
        :-moz-placeholder { /* Firefox 18- */
          color: ${themeProp('placeholderColor')};
        }
      }
    }
  }

  .control-panel {
    border-top: 1px solid ${themeProp('mainBorder')} !important;
    border-bottom: 1px solid ${themeProp('mainBorder')} !important;

    .icon {
      color: ${themeProp('controlPanelIcon')};
      &:hover,
      &.active {
        color: ${themeProp('controlPanelIconHover')};
      }
    }
  }

  .worklog {
    .worklog-item {
      border-bottom: 1px solid ${themeProp('mainBorder')};

      .date, .user {
        color: ${themeProp('mainText')};
        opacity: 0.6;
      }
    }
  }

  .editor-js-wrapper {
    border: 1px solid ${themeProp('mainBorder')};
  }

  .pagination {
    i {
      color: ${themeProp('mainText')};

      &:hover {
        color: ${themeProp('mainTextHover')};
      }
    }
  }

  .filter {
    .filter-label {
      .filter.link.icon {
        color: ${themeProp('mainText')};

        &:hover {
          color: ${themeProp('mainTextHover')};
        }
      }
    }

    .filter-menu-trigger {
      color: ${themeProp('mainText')};

      &:hover {
        color: ${themeProp('mainTextHover')};
      }
    }
  }

  //-----------------------------------------
  // Semantic UI Overides
  //-----------------------------------------

  .ui {

    &.label {
      color: ${themeProp('button')} !important;
      background: ${themeProp('buttonBackground')} !important;
      &:hover {
        color: ${themeProp('button')} !important;
        background-color: ${themeProp('buttonBackgroundHover')} !important;
      }
    }

    &.dropdown, .menu .ui.dropdown {
      .menu-trigger {
        color: ${themeProp('mainText')};
      }

      .menu {
        border: 1px solid ${themeProp('mainBorder')} !important;
        &>.item {
          color: ${themeProp('mainText')} !important;
          &:hover {
            background-color: ${themeProp('menuItemBackgroundHover')} !important;
          }
          &.active {
            background-color: ${themeProp('menuItemBackgroundActive')} !important;
          }
          &:before {
            background-color: ${themeProp('mainBorder')} !important;
          }
        }
        > .header {
          color: ${themeProp('mainText')};
        }
        &>.divider {
          border-top: 1px solid ${themeProp('mainBorder')} !important;
        }
      }
    }

    &.menu {
      .dropdown.item .ui.vertical.menu {
        background-color: ${themeProp('menuBackground')};
      }

      &.top {
        .item {
          color: ${themeProp('mainText')};
          &:before {
            background: ${themeProp('mainBorder')} !important;
          }
          &:hover {
            background-color: ${themeProp('menuItemBackgroundHover')};
            color: ${themeProp('mainTextHover')};
          }
          &.active {
            background-color: ${themeProp('menuItemBackgroundActive')};
            color: ${themeProp('mainTextHover')};
          }
        }
      }
      &.tabular {
        border-bottom: 1px solid ${themeProp('mainBorder')} !important;
        .item {
          color: ${themeProp('mainText')};
          &.active {
            position: relative;
            color: ${themeProp('formTabLabelActive')} !important;
            border-color: ${themeProp('mainBorder')} !important;
            background: ${themeProp('mainBackground')};
            &:after {
              background-color: ${themeProp('mainBackground')};
            }
          }
        }
      }
      &.pointing {
        .item.active {
          color: ${themeProp('buttonBasicBackground')} !important;
          border-color: ${themeProp('buttonBasicBackground')} !important;
        }
      }

      &.secondary {
        border-color: ${themeProp('mainBorder')} !important;
        .item {
          color: ${themeProp('formTabLabel')} !important;
          border-color: ${themeProp('mainBorder')} !important;
          &.active {
            color: ${themeProp('formTabLabelActive')} !important;
            border-color: ${themeProp('formTabLabelActive')} !important;
          }
        }
      }
    }

    &.header {
      color: ${themeProp('mainText')};
    }

    &.form,
    &.page {
      .field.disabled input,
      .field.disabled textarea,
      .field.disabled .ui.checkbox label::before,
      .field.disabled .dropdown {
        background-color: ${themeProp('inputDisabledBackground')} !important;
      }

      input:not([type]),
      input[type=text],
      input[type=email],
      input[type=search],
      input[type=password],
      input[type=date],
      input[type=datetime-local]
      input[type=tel],
      input[type=time],
      input[type=url],
      input[type=number] {
        border: 1px solid ${themeProp('inputBorder')};
        background: ${themeProp('formInputBackground')};
        color: ${themeProp('mainText')};

        &:not([disabled]) {
          &:hover {
            border: 1px solid ${themeProp('inputBorderHover')};
          }
          &:active,
          &:focus {
            border: 1px solid ${themeProp('inputBorderActive')};
          }
        }
      }

      .field {
        &>label {
          color: ${themeProp('mainText')};
        }
        &.error {
          .dropdown.selection {
            background-color: ${themeProp('inputErrorBackground')} !important;
            border-color: ${themeProp('inputErrorBorder')};
            color: ${themeProp('inputError')} !important;
            &:focus {
              background: ${themeProp('inputErrorBackground')};
            }
          }

          input {
            background-color: ${themeProp('inputErrorBackground')} !important;
            border-color: ${themeProp('inputErrorBorder')};
            color: ${themeProp('inputError')} !important;
          }
        }
      }

      .fields {
        &.disabled {
          .field {
            opacity: 1;
          }
        }
      }

      textarea {
        border: 1px solid ${themeProp('inputBorder')};
        background-color: ${themeProp('inputBackground')};
        color: ${themeProp('mainText')};

        &:not([disabled]) {
          &:hover {
            border: 1px solid ${themeProp('inputBorderHover')};
          }
          &:active,
          &:focus {
            border: 1px solid ${themeProp('inputBorderActive')};
          }
        }
      }
    }

    &.input {
      color: ${themeProp('mainText')};

      input {
        color: ${themeProp('mainText')};
        border: 1px solid ${themeProp('inputBorder')};
        background-color: ${themeProp('inputBackground')};
      }
      &:not(.disabled) {
        input:hover {
          border: 1px solid ${themeProp('inputBorderHover')};
        }
        input:active {
          border: 1px solid ${themeProp('inputBorderActive')};
        }
      }
    }

    &[class*="left action"].input > .button:first-child,
    &[class*="left action"].input > .buttons:first-child > .button,
    &[class*="left action"].input > .dropdown:first-child {
      background-color: ${themeProp('inputBackground')};
      color: ${themeProp('mainText')};
      border: 1px solid ${themeProp('inputBorder')};
      &:hover {
        border: 1px solid ${themeProp('inputBorderHover')};
      }
      &:active {
        border: 1px solid ${themeProp('inputBorder')};
      }
    }
    &[class*="left action"].input > input:focus {
      border-left-color: transparent !important;
    }

    &.checkbox label,
    &.checkbox+label {
      color: ${themeProp('mainText')} !important;
      &::before {
        border-color: ${themeProp('inputBorder')} !important;
        background: ${themeProp('inputBackground')} !important;
      }
      &::after {
        color: ${themeProp('mainText')} !important;
      }
    }

    &.dropdown {
      .menu {
        background-color: ${themeProp('dropdownBackground')} !important;
        & > .message:not(.ui) {
          color: ${themeProp('dropdownMessage')};
        }
        & > .item {
          color: ${themeProp('mainText')} !important;
          &:hover {
            background: ${themeProp('menuItemBackgroundHover')} !important;
          }
        }
        .selected.item {
          background: ${themeProp('menuItemBackgroundActive')} !important;
        }
      }
      &.selected {
        background: ${themeProp('menuItemBackgroundActive')} !important;
      }
      &.selection {
        border: 1px solid ${themeProp('inputBorder')} !important;
        background-color: ${themeProp('mainBackground')};
        color: ${themeProp('mainText')};
        &:hover {
          border: 1px solid ${themeProp('inputBorderHover')} !important;
        }
        &:active,
        &:focus {
          border: 1px solid ${themeProp('inputBorderActive')} !important;
        }
        &.active {
            border-color: ${themeProp('inputBorderActive')} !important;
          .menu {
            border-color: ${themeProp('inputBorderActive')} !important;
          }
          &:hover {
            border-color: ${themeProp('inputBorderActive')} !important;
            .menu {
              border-color: ${themeProp('inputBorderActive')} !important;
            }
          }
        }
        &.visible>.text:not(.default) {
          color: ${themeProp('mainText')} !important;
        }
        .menu {
          & > .item {
            border-top: 1px solid ${themeProp('mainBorder')} !important;
          }
        }
      }
      &.pointing > .menu:after {
        display: none;
      }
    }

    &.search-bar {
      color: ${themeProp('searchBar')};
      input {
        color: ${themeProp('searchBar')};
      }
    }



    &.table {
      border: 1px solid ${themeProp('tableBorder')};
      background-color: ${themeProp('tableBackground')};
      color: ${themeProp('mainText')};
      margin: 0;

      thead {
        th:not(.card-section-header) {
          color: ${themeProp('tableTh')} !important;
          border-bottom: 1px solid ${themeProp('tableBorder')};
          background-color: ${themeProp('tableThBackground')};
          &:hover {
            background-color: ${themeProp('tableThBackgroundHover')} !important;
          }
          &:active,
          &.sorted {
            background-color: ${themeProp('tableThBackgroundActive')};
          }
        }
      }
      tr {
        &:first-child {
          td:not(.card-cell) {
            border-top: none !important;
          }
        }
        td {
          border-top: 1px solid ${themeProp('tableBorder')};
        }
      }
      &.celled tr td,
      &.celled tr th {
        border-left: 1px solid ${themeProp('tableBorder')};
        &:first-child {
          border-left: none !important;
        }
      }
      &.sortable,
      &.selectable {
        thead th {
          color: ${themeProp('tableTh')};
        }
      }
      &.selectable {
        tbody tr:hover {
          background-color: ${themeProp('tableSelectableTrBackgroundColor')} !important;
        }
      }
    }

    &.button {
      color: ${themeProp('button')} !important;
      background: ${themeProp('buttonBackground')} !important;
      &:hover {
        color: ${themeProp('button')} !important;
        background-color: ${themeProp('buttonBackgroundHover')} !important;
      }
      &:active,
      &.active {
        color: ${themeProp('button')} !important;
        background-color: ${themeProp('buttonBackgroundActive')} !important;
      }
      &.red {
        color: ${themeProp('buttonRed')} !important;
        background-color: ${themeProp('buttonRedBackground')} !important;
        &:hover {
          color: ${themeProp('buttonRedHover')} !important;
          background-color: ${themeProp('buttonRedBackgroundHover')} !important;
        }
        &:active {
          color: ${themeProp('buttonRedHover')} !important;
          background-color: ${themeProp('buttonRedBackgroundActive')} !important;
        }
      }
      &.basic {
        transition: none;
        box-shadow: 0 0 0 1px ${themeProp('inputBorder')} inset;
        background-color: ${themeProp('buttonBasicBackground')} !important;
        color: ${themeProp('buttonBasic')} !important;
        &:hover {
          box-shadow: 0 0 0 1px ${themeProp('inputBorderHover')} inset;
          background-color: ${themeProp('buttonBasicBackgroundHover')} !important;
          color: ${themeProp('buttonBasicHover')} !important;
        }
        &:active {
          box-shadow: 0 0 0 1px ${themeProp('inputBorderActive')} inset;
          background-color: ${themeProp('buttonBasicBackgroundActive')} !important;
          color: ${themeProp('buttonBasicHover')} !important;
        }
        &.red {
          color: ${themeProp('buttonBasicRed')};
          background-color: ${themeProp('buttonBasicRedBackground')} !important;
          &:hover {
            background-color: ${themeProp('buttonBasicRedBackgroundHover')} !important;
          },
          &:active {
            background-color: ${themeProp('buttonBasicRedBackgroundActive')} !important;
          }
        }
        &.middle-header-more-actions-trigger {
          box-shadow: 0 0 0 1px ${themeProp('middleHeaderMoreActionsTrigger')} inset;
        }
      }
      &.filter-field-selector {
        color: ${themeProp('mainText')} !important;
        background-color: ${themeProp('inputBackground')} !important;
        &:hover {
          background-color: ${themeProp('inputBackground')} !important;
        },
      }
    }

    &.buttons {
      &.button {
        &.basic {
          border: 1px solid ${themeProp('inputBorder')};
          background-color: ${themeProp('inputBackground')};
          color: ${themeProp('mainText')};
          &:hover {
            border: 1px solid ${themeProp('inputBorderHover')};
            background-color: ${themeProp('menuItemBackgroundHover')};
          }
          &:active {
            border: 1px solid ${themeProp('inputBorderActive')};
            background-color: ${themeProp('menuItemBackgroundActive')};
          }
        }
      }
    }

    &.divider:not(.vertical):not(.horizontal) {
      border-top: 1px solid ${themeProp('mainBorder')};
      border-bottom: none !important;
    }

    &.divider.horizontal {
      color: ${themeProp('mainText')};
      &:after, &:before {
        background: ${themeProp('mainBorder')};
      }
    }

    &.modal {
      background-color: ${themeProp('mainBackground')};
      .content {
        background-color: ${themeProp('mainBackground')};
      }
    }

    &.segment {
      z-index: 0;
      .dimmer {
        background-color: transparent;
      }
      .loader-pattern {
        background-color: transparent;
        background-image: linear-gradient(transparent 55%, ${themeProp('mainBorder')} 55%);
      }
    }

    &.icon.input > i.icon:not(.link) {
      color: ${themeProp('mainText')};
    }

    i.black.icon {
      color: ${themeProp('mainText')} !important;
    }
  }

  .dashboard-content {
    background-color: ${themeProp('dashboardBackground')};
    .widget {
      background-color: ${themeProp('widgetBackground')};
      .widget-header {
        color: ${themeProp('widgetHeader')};
        background-color: ${themeProp('widgetHeaderBackground')};
        border-bottom: 1px solid ${themeProp('widgetHeaderBorder')};
      }
      .widget-tab .item {
        border-color: ${themeProp('mainBorder')} !important;
      }
    }
    .ui {
      &.table {
        thead {
          th {
            color: ${themeProp('dashboardTableTh')} !important;
            border-bottom: 1px solid ${themeProp('tableBorder')};
            background-color: ${themeProp('dashboardTableThBackground')};
            &:hover {
              background-color: ${themeProp('dashboardTableThBackgroundHover')} !important;
            }
            &:active,
            &.sorted {
              background-color: ${themeProp('dashboardTableThBackgroundActive')};
            }
          }
        }
      }
    }
  }

  //-----------------------------------------
  // Custom styles
  //-----------------------------------------

  .ui.form {
    .grid {
      .section {
        &.opened {
          position: relative;
          &::before {
            content: '';
            position: absolute;
            top: 40px;
            left: 13px;
            width: 1px;
            height: calc(100% - 40px);
            background-color: ${themeProp('mainBorder')};
          }
          .column > div:last-child {
            margin-bottom: 0 !important;
          }
        }
      }
    }
  }

  .ui.form {
    .field.data_visual {
      .section.opened {
        .column {
          padding-left: 2rem;
        }
      }
    }
  }

  .record-detail {
    .icon {
      color: ${themeProp('mainText')};
    }
  }

  .reference-field {
    .input {
      div.text {
        color: ${themeProp('mainText')};
      }
      &.not-valid {
        div.text,
        input {
          color: ${themeProp('mainTextInvalid')} !important;
        }
      }
    }

    .label {
      &.not-valid {
        color: ${themeProp('mainTextInvalid')} !important;
        background-color: ${themeProp('inputErrorBackground')} !important;
      }
    }

    .record-detail,
    .record-creator {
      .icon {
        color: ${themeProp('fieldIcon')};
      }
    }
  }

  .field-extra,
  .field-extra-comments-input {
    .icon {
      color: ${themeProp('fieldIcon')};
    }
  }

  .file-field {
    .icon {
      color: ${themeProp('fieldIcon')};
      opacity: 1;
    }
  }

  .toggle-system-sidebar-icon {
    color: ${themeProp('mainText')};
  }

  .controls {
    color: ${themeProp('mainText')};
    opacity: 0.7;
    &.disabled {
      .icon {
        opacity: 0.5;
        &:hover {
          opacity: 0.5;
        }
      }
    }
    .icon {
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
    }
  }

  .scrollable-list {
    background-color: ${themeProp('scrollableListBackground')};
    border: 1px solid ${themeProp('scrollableListBorder')};
    .scrollable-list-item {
      border-bottom: 1px solid ${themeProp('scrollableListItemBorderBottom')} !important;
      &.component {
        color: ${themeProp('scrollableListComponent')};
      }
      &:hover {
        color: ${themeProp('mainText')};
        background-color: ${themeProp('scrollableListComponentBackgroundHover')} !important;
      }
      &.active {
        color: ${themeProp('mainText')};
        background-color: ${themeProp('scrollableListComponentBackgroundActive')} !important;
      }
    }
  }

  .worklog {
    background-color: ${themeProp('worklogBackground')};
    border: 1px solid ${themeProp('worklogBorder')};
  }

  .view-map {
    background-color: ${themeProp('mainBackground')};

    .legend {
      border: 1px solid ${themeProp('mainBorder')};
      background-color: ${themeProp('mainBackground')};
    }

    .view-map-control-button {
      background-color: ${themeProp('mainBackground')};

      &:hover {
        background-color: ${themeProp('scrollableListComponentBackgroundHover')};
      }

      &.active {
        background-color: ${themeProp('scrollableListComponentBackgroundHover')};
        box-shadow: 0 0 0 2px ${themeProp('inputBorderActive')};
      }

      &.disabled {
        background-color: ${themeProp('mainBackground')};

        > * {
          opacity: 0.4;
        }
      }
    }

    .legend-list-wrapper {
      border-bottom: 1px solid ${themeProp('mainBorder')};
    }

    .view-map-control button {
      border-top: 1px solid ${themeProp('mainBorder')};
      background-color: ${themeProp('mainBackground')};

      &:hover {
        background-color: ${themeProp('scrollableListComponentBackgroundHover')};
      }

      &:first-child {
        border-top: none;
      }

      span::after {
        color:${themeProp('mainText')};
      }
    }
  }

  .connection-legend {
    background-color: ${themeProp('mainBackground')};

    .legend {
      border: 1px solid ${themeProp('mainBorder')};
      background-color: ${themeProp('mainBackground')};
    }

    .connection-legend-control-button {
      background-color: ${themeProp('mainBackground')};

      &:hover {
        background-color: ${themeProp('scrollableListComponentBackgroundHover')};
      }

      &.active {
        background-color: ${themeProp('scrollableListComponentBackgroundHover')};
        box-shadow: 0 0 0 2px ${themeProp('inputBorderActive')};
      }

      &.disabled {
        background-color: ${themeProp('mainBackground')};

        > * {
          opacity: 0.4;
        }
      }
    }

    .legend-list-wrapper {
      border-bottom: 1px solid ${themeProp('mainBorder')};
    }

    .connection-legend-control button {
      border-top: 1px solid ${themeProp('mainBorder')};
      background-color: ${themeProp('mainBackground')};

      &:hover {
        background-color: ${themeProp('scrollableListComponentBackgroundHover')};
      }

      &:first-child {
        border-top: none;
      }

      span::after {
        color:${themeProp('mainText')};
      }
    }
  }

  .table-container {
    .value-popup {
      border: 1px solid ${themeProp('mainBorder')};
      color: ${themeProp('mainText')};
      background-color: ${themeProp('tableBackground')};
      white-space: nowrap;

      .popup-controls {
        display: inline-block;
        vertical-align: top;
        margin-top: 6px;
      }
    }
  }

  .actions-bar.buttons-as-icons {
    > .button, > .dropdown > .button {
      box-shadow: none !important;
      background-color: ${themeProp('mainBackground')} !important;
      color: ${themeProp('fieldIcon')} !important;
      &:hover {
        color: ${themeProp('mainTextHover')} !important;
      }
    }
  }

  .filter {
    .nonclickable-field, .nonclickable-field:hover {
      background-color: ${themeProp('scrollableListComponentBackgroundActive')} !important;
      pointer-events: none;
    }
  }

  .search-bar-calendar {
    background-color: #fff;

    .input {
      .field {
        .dropdown {
          div.text {
            color: ${themeProp('placeholderColor')};
          }
        }
      }
    }
  }

  //-----------------------------------------
  // amCharts
  //-----------------------------------------

  .amcharts-chart-div, .amcharts-legend-div {
    text, tspan {
      fill: ${themeProp('mainText')};
    }
    > svg > g + g > g > g:not([clip-path]) > path {
      stroke: ${themeProp('amChartsGrid')};;
      stroke-opacity: 0.3;
    }
  }

  //-----------------------------------------
  // leaflet
  //-----------------------------------------

  .leaflet-touch .leaflet-bar {
    border: 1px solid ${themeProp('mainBorder')};
    a {
      color: ${themeProp('mainText')};
      background-color: ${themeProp('mainBackground')};
      &:first-child {
        border-bottom: 1px solid ${themeProp('mainBorder')};
      }
    }
  }

  //-----------------------------------------
  // react-contextmenu
  //-----------------------------------------

  .react-contextmenu {
    border: 1px solid ${themeProp('mainBorder')};
    background: ${themeProp('menuBackground')};
    box-shadow: none;
    .react-contextmenu-item {
      color: ${themeProp('mainText')};
      &:hover {
        color: ${themeProp('mainText')};
        background: ${themeProp('menuItemBackgroundHover')};
      }
    }
  }

  //-----------------------------------------
  // react-slider
  //-----------------------------------------

  .rc-slider-rail {
    background-color: ${themeProp('sliderRailBackground')};
  }

  .rc-slider-track {
    background-color: ${themeProp('sliderTrackBackground')};
  }

  .rc-slider-step {
    .rc-slider-dot-active {
      border-color: ${themeProp('sliderDotActiveBorder')};
      background-color: ${themeProp('sliderDotActiveBackground')};
    }
  }

  .rc-slider-handle {
    border-color: ${themeProp('sliderHandleBorder')};
    background-color: ${themeProp('sliderHandleBackground')};
    &:hover,
    &:active {
      border-color: ${themeProp('sliderHandleBorderHover')};
      box-shadow: 0 0 5px ${themeProp('sliderHandleBorderHover')};
    }
  }

  //-----------------------------------------
  // react-tree
  //-----------------------------------------


  .data-template {
    > .content {
      background-color: ${themeProp('mainBackground')};
      border: 1px solid ${themeProp('mainBorder')};
      .details .control-buttons {
        border-top: 1px solid ${themeProp('mainBorder')};
      }
      .tree {
        border-right: 1px solid ${themeProp('mainBorder')};
      }
      .rc-tree {
        .rc-tree-node-content-wrapper {
          color: ${themeProp('mainText')};
        }
        .rc-tree-node-selected,
        .drag-over > .rc-tree-node-content-wrapper {
          color: ${themeProp('mainText')};
          background-color: ${themeProp('mainBorder')};
        }
        .drag-over-gap-top > .rc-tree-node-content-wrapper {
          border-top: 2px solid ${themeProp('mainTextHover')};
        }
        .drag-over-gap-bottom > .rc-tree-node-content-wrapper {
          border-bottom: 2px solid ${themeProp('mainTextHover')};
        }
        .placeholder.drag-over {
          > .rc-tree-node-content-wrapper {
            background-color: ${themeProp('mainBackground')};
          }
        }
        .placeholder.drag-over-gap-top {
          > .rc-tree-node-content-wrapper {
            border-top: 2px solid ${themeProp('mainBackground')};
          }
        }
        .placeholder.drag-over,
        .placeholder.drag-over-gap-bottom {
          > .rc-tree-node-content-wrapper {
            border-bottom: 2px solid ${themeProp('mainBackground')};
          }
        }
        .item-templates .rc-tree-node-content-wrapper {
          color: ${themeProp('buttonBasic')};
          background-color: ${themeProp('buttonBasicBackground')};
          box-shadow: 0 0 0 1px ${themeProp('inputBorder')} inset;
          &:hover {
            color: ${themeProp('buttonBasicHover')};
            background-color: ${themeProp('buttonBasicBackgroundHover')};
            box-shadow: 0 0 0 1px ${themeProp('inputBorderHover')} inset;
          }
        }
      }
    }
  }

  //-----------------------------------------
  // reference-to-list
  //-----------------------------------------


  .reference-to-list {
    .reference-to-list-tree {
      border: 1px solid ${themeProp('mainBorder')};
    }
    .tree-control {
      color: ${themeProp('fieldIcon')};
    }
  }

  //-----------------------------------------
  // ace-editor
  //-----------------------------------------

  .ace_editor {
    border-color: ${themeProp('inputBorder')} !important;
  }

  //-----------------------------------------
  // mapbox
  //-----------------------------------------

  .mapboxgl-ctrl-group {
    background-color: ${themeProp('mainBackground')};
  }

  .mapbox-tooltip {
    border: 1px solid ${themeProp('mainBorder')};
    color: ${themeProp('mainText')};
    background: ${themeProp('mainBackground')};
    box-shadow: none;
  }

  //-----------------------------------------
  // slick-slider
  //-----------------------------------------

  .slick-slider .slick-list .selected {
    background-color: ${themeProp('sliderHandleBorder')};
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    //-----------------------------------------
    // Globals
    //-----------------------------------------

    height: 100%;

    //-----------------------------------------
    // Components
    //-----------------------------------------

    .system-sidebar {
      > div {
        border: 1px solid ${themeProp('mainBorder')};
      }
    }

    .legend {
      > div {
        border: 1px solid ${themeProp('mainBorder')};
      }
    }

    //-----------------------------------------
    // Shared Components
    //-----------------------------------------

    .icon-button {
      border: 1px solid ${themeProp('mainBorder')};
    }

    .control-panel {
      .icon {
        &:nth-child(2) {
          border-left: 1px solid ${themeProp('mainBorder')};
          border-right: 1px solid ${themeProp('mainBorder')};
        }
      }
    }

    //-----------------------------------------
    // Semantic UI Overides
    //-----------------------------------------

    .ui {
      &.dropdown, .menu .ui.dropdown {
        .menu-trigger {
          border: 1px solid ${themeProp('mainBorder')};
        }
      }
    }
  }
`;
