import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon } from 'semantic-ui-react';
import { isEmpty } from 'lodash/lang';
import Header from '../../../../../shared/header';

import Column from './column';

const MIN_CONTROL_WIDTH_LABEL_LEFT = 65;
const MIN_CONTROL_WIDTH_LABEL_TOP = 90;
const CONTROL_WIDTH = 195;
const LABEL_WIDTH = 130;

export default class Section extends Component {
  static propTypes = {
    section: PropTypes.object.isRequired,
    opened: PropTypes.bool,
    inlined: PropTypes.bool,
    showLabel: PropTypes.bool,
    elementRenderer: PropTypes.func.isRequired,
    embeddedViewRenderer: PropTypes.func.isRequired,
  }

  static defaultProps = {
    opened: true,
    inlined: true,
    showLabel: true,
  };

  constructor(props) {
    super(props);
    this.state = { opened: !!(props.opened || props.section.params.opened) };
  }

  toggleVisibility = () => this.setState({ opened: !this.state.opened });

  renderSectionLabel = () => {
    const { section: { params = {} } } = this.props;
    const { opened } = this.state;

    return (
      <Header toggleable onClick={this.toggleVisibility} opened={opened} {...params} />
    );
  }

  getColumnWidth = () => {
    const { section: { columns } } = this.props;
    return (100 / columns.length) + '%';
  }

  getColumnMinWidth = () => {
    const { section: { params = {} }, inlined } = this.props;
    const elementMinWidth = parseInt(params.min_width);
    const defaultMinWidth = inlined ? MIN_CONTROL_WIDTH_LABEL_LEFT : MIN_CONTROL_WIDTH_LABEL_TOP;

    let minWidth = elementMinWidth || defaultMinWidth;
    if (minWidth < elementMinWidth) minWidth = defaultMinWidth;
    if (minWidth > CONTROL_WIDTH) minWidth = CONTROL_WIDTH;

    return inlined ? LABEL_WIDTH + minWidth : minWidth;
  }

  renderColumn = (column, i) => {
    const { elementRenderer, embeddedViewRenderer } = this.props;
    const { components, params } = column;

    return (
      <Column
        key={i}
        components={components}
        elementRenderer={elementRenderer}
        embeddedViewRenderer={embeddedViewRenderer}
        params={params}
        width={this.getColumnWidth()}
        minWidth={this.getColumnMinWidth() + 'px'}
      />
    );
  }

  renderColumns = () => {
    const { section: { params = {}, columns = [] } } = this.props;

    if (isEmpty(columns)) return null;

    const classNameGrid = `form-section-grid${columns.length > 1 ? ' columns': ''}`;
    const classNameGridRow = `form-section-row${params.embedded_view ? ' embedded-view' : ''}`;

    return (
      <Grid className={classNameGrid} columns="equal">
        <Grid.Row className={classNameGridRow}>
          {columns.map(this.renderColumn)}
        </Grid.Row>
      </Grid>
    );
  }

  render() {
    const { section: { params = {} }, showLabel, embeddedViewRenderer } = this.props;
    const opened = this.state.opened ? ' opened' : '';
    const named = params.name ? ' named' : '';
    const className = `section${opened}${named}`;
    const style = {};

    return (
      <div className={className} style={style}>
        {showLabel && params.name && this.renderSectionLabel()}
        {this.state.opened && this.renderColumns()}
        {this.state.opened && params.embedded_view && embeddedViewRenderer(params.embedded_view)}
      </div>
    );
  }
}
