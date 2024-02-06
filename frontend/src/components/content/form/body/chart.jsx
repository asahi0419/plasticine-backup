import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Segment } from 'semantic-ui-react';

import Chart from '../../../shared/chart';
import Loader from '../../../shared/loader';
import { loadChartScope } from '../../../../actions/db/view/chart';

export default class ChartComponent extends Component {
  static propTypes = {
    inline: PropTypes.bool,
    label: PropTypes.string,
    record: PropTypes.object.isRequired,
  }

  static defaultProps = {
    label: 'Chart',
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  loadContent = async () => {
    const { record } = this.props;
    const { filter } = record;

    if (!record.data_source) return this.setState({ preview: false, error: 'no data source' });

    const { error, scope } = await loadChartScope(record.id, { filter });

    this.setState({ scope, error });
  }

  handleClickPreview = () => {
    this.setState({ preview: true });
    this.loadContent();
  }

  handleClickClosePreview = () => {
    this.setState({ preview: false, scope: null });
  }

  handleClickRefresh = () => {
    this.setState({ scope: null });
    this.loadContent();
  }

  handleError = (error) => {
    const name = `Client script: ${error.stack.slice(0, error.stack.indexOf(':'))}`;
    const description = error.message;

    this.setState({ error: { name, description } });
  }

  renderException() {
    const { record } = this.props;
    const { error } = this.state;

    const style = { lineHeight: '32px' };

    if (error === 'no data source') return <div style={style}>Data source is required.</div>;
  }

  renderButtonPreview() {
    const style = { marginRight: '10px' };

    return this.state.preview
      ? <Button style={style} onClick={this.handleClickClosePreview}>Close preview</Button>
      : <Button style={style} onClick={this.handleClickPreview}>Preview</Button>;
  }

  renderButtonRefresh() {
    const style = { marginRight: '10px' };

    if (!this.state.preview) return;

    return <Button style={style} onClick={this.handleClickRefresh}>Refresh</Button>;
  }

  renderButtons() {
    const style = { display: 'flex' };
    const buttonStyle = { marginRight: '10px' };

    return (
      <div style={style}>
        {this.renderButtonPreview()}
        {this.renderButtonRefresh()}
        {this.renderException()}
      </div>
    )
  }

  renderLoader = () => {
    return <Loader dimmer={true} size="medium" />;
  }

  renderChart = () => {
    const { record } = this.props;
    const { error, scope } = this.state;

    return (
      <Chart
        error={error}
        scope={scope}
        builder={record.client_script}
        version={record.version}
        handleError={this.handleError}
      />
    );
  }

  renderChartWrapper() {
    const { error, scope, preview } = this.state;

    if (!preview) return;

    const style = {
      position: 'relative',
      height: error ? 'auto' : '430px',
      marginTop: error ? '10px' : '20px',
    };

    return (
      <div style={style}>
        {scope ? this.renderChart() : this.renderLoader()}
      </div>
    );
  }

  renderContent() {
    const { record, inline } = this.props;
    const { error, preview } = this.state;

    const style = {
      display: 'inline-block',
      width: inline ? 'calc(100% - 130px)' : '100%',
      minWidth: inline ? 'calc(100% - 130px)' : '100%',
      margin: 0,
      verticalAlign: 'top',
    };

    const segemtStyle = {
      padding: '7px 9px',
      height: preview && !error ? '500px' : 'auto',
    };

    return (
      <div style={style}>
        <Segment className="chart" style={segemtStyle}>
          {this.renderButtons()}
          {this.renderChartWrapper()}
        </Segment>
      </div>
    );
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
