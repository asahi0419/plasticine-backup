import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Worklog from '../../../shared/worklog';

export default class WorklogComponent extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    inline: PropTypes.bool,
    label: PropTypes.string,
    options: PropTypes.object,
  }

  static defaultProps = {
    label: 'Worklog',
    options: {},
  }

  renderLabel() {
    const { inline, label } = this.props;

    let labelStyle = {
      marginTop: inline ? 8 : 0,
      marginRight: 15,
      marginBottom: inline ? 0 : '.28rem',
      width: inline ? 115 : 'auto',
      minWidth: inline ? 115 : 'auto',
      textAlign: inline ? 'right' : 'left',
      overflowWrap: 'break-word',
    };

    const labelContentStyle = { fontSize: '1em' };

    return <div style={labelStyle}><span style={labelContentStyle}>{label}</span></div>;
  }

  renderContent() {
    const { model, record, inline, options, comments } = this.props;

    const style = {
      display: 'inline-block',
      width: inline ? 'calc(100% - 130px)' : '100%',
      minWidth: inline ? 'calc(100% - 130px)' : '100%',
      margin: 0,
      verticalAlign: 'top',
    };

    return (
      <div style={style}>
        <Worklog
          model={model}
          record={record}
          options={options}
        />
      </div>
    );
  }

  render() {
    const className = `${this.props.inline ? 'inline' : ''} field`;

    return (
      <div className={className}>
        {this.renderLabel()}
        {this.renderContent()}
      </div>
    );
  }
}
