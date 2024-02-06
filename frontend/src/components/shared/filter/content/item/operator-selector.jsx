import React from 'react';
import styled from 'styled-components';
import { Input } from 'semantic-ui-react';
import { map } from 'lodash/collection';

import * as CONSTANTS from '../../../../../constants';

import Dropdown from '../../../inputs/dropdown';

const OperatorSelectorStyled = styled.div`
  width: 200px;

  .ui.dropdown {
    min-width: 140px;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    width: 100%;
  }
`;

export default ({ operators, selected, hidden, onChange, upward }) => {
  const options = map(operators, (text, value) => ({ value, text }));

  if (hidden) {
    return (
      <div style={{ display: 'none' }}>
        <Input value={selected} type="hidden" />
      </div>
    );
  }

  return (
    <OperatorSelectorStyled>
      <Dropdown
        selection
        upward={upward}
        options={options}
        value={selected}
        onChange={onChange}
      />
    </OperatorSelectorStyled>
  );
};
