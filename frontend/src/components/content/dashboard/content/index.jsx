import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGridLayout from 'react-grid-layout';
import { keyBy } from 'lodash/collection';
import { pick } from 'lodash/object';

import WidthProvider from './width-provider';
import Widget from './widget';

const GridLayout = WidthProvider(ReactGridLayout);

export default class Content extends Component {
  static propTypes = {
    mode: PropTypes.oneOf(['view', 'edit']),
    dashboard: PropTypes.object.isRequired,
    config: PropTypes.shape({
      layout: PropTypes.array.isRequired,
    }),
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
  }

  handleChangeLayout = (data = []) => {
    const mapping = keyBy(data, 'i');
    const layout = this.props.config.layout.map((w = {}) => ({ ...w, ...pick(mapping[w.i], ['h', 'w', 'x', 'y']) }));
    this.props.onChange({ layout });
  }

  handleChangeWidget = (options = {}) => {
    const layout = this.props.config.layout.map((w = {}) => ((w.i === options.id) ? { ...w, ...options } : w))
    this.props.onChange({ layout });
  }

  handleRemoveWidget = (options = {}) => {
    const confirmMessage = i18n.t('dashboard_view_widget_remove_confirmation', { defaultValue: 'Widget will be completely removed. Proceed?' });
    if (!confirm(confirmMessage)) return;

    const layout = this.props.config.layout.filter((w = {}) => (w.i !== options.id));
    this.props.onChange({ layout });
  }

  renderWidget = ({ i: id, name, tabs }) => {
    const dataToRelate = this.props.config.layout.filter((w = {}) => w.i !== id);

    return (
      <Widget
        id={id}
        name={name}
        tabs={tabs}
        mode={this.props.mode}
        dataToRelate={dataToRelate}
        dashboard={this.props.dashboard}
        onChange={this.handleChangeWidget}
        onRemove={this.handleRemoveWidget}
      />
    );
  }

  renderLayout() {
    const { mode, config: { layout = [] } } = this.props;
    if (!layout.length) return;

    return (
      <GridLayout
        layout={layout}
        cols={12}
        rowHeight={30}
        margin={[15, 15]}
        isDraggable={mode === 'edit'}
        isResizable={mode === 'edit'}
        onLayoutChange={this.handleChangeLayout}
        useCSSTransforms={false}
        className="layout"
      >
        {layout.map((w = {}) => <div key={w.i}>{this.renderWidget(w)}</div>)}
      </GridLayout>
    );
  }

  render() {
    return (
      <div className="dashboard-content" style={this.props.style}>
        {this.renderLayout()}
      </div>
    );
  }
}
