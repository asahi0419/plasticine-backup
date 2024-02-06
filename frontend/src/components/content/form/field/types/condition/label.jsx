import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const LabelStyled = styled.div`
  margin-bottom: 5px;

  .icon.code {
    margin-right: 0.5em;
    line-height: 32px;
  }
  .condition-label {
    line-height: 32px;
  }
  .condition-label, .condition-string {
    cursor: pointer;

    &:hover { text-decoration: underline }
  }
`;

export default class ConditionLabel extends Component {
  static propTypes = {
    humanizedCondition: PropTypes.string,
    onClick: PropTypes.func.isRequired,
  }

  render() {
    const { onClick, humanizedCondition } = this.props;

    return (
      <LabelStyled>
        <Icon name="code" onClick={onClick} link />
        {/*<span className="condition-label" onClick={onClick}>*/}
          {/*{i18n.t('condition', { defaultValue: 'Condition' })}*/}
        {/*</span>*/}
        {/*:&nbsp;&nbsp;*/}
        {this.props.children || <span className="condition-string" onClick={onClick}>{humanizedCondition}</span>}
      </LabelStyled>
    );
  }
}
