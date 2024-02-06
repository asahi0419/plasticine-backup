import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Sandbox from '../../../../../sandbox';
import ActionsBar from '../../../../content/action/actions-bar';
import * as MAP_VIEW_HELPERS from './helpers';

const VISIBLE_ACTIONS_LENGTH = 2;

export default class Tip extends React.Component {
  static propTypes = {
    coordinate: PropTypes.array.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    actions: PropTypes.array.isRequired,
    context: PropTypes.string.isRequired,
  }

  static contextTypes = {
    sandbox: PropTypes.object,
  }

  static childContextTypes = {
    sandbox: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0,
      },
    };
  }

  getChildContext() {
    const { data: object = {}, coordinate = [] } = this.props;
    const { this: parent } = this.context.sandbox.getContext();

    const { geometry = {} } = object;

    const uiObject = {
      parent,
      attributes: {
        ...object,
        geometry,
        event: {
          coordinates: geometry.type === 'Point'
            ? MAP_VIEW_HELPERS.roundCoordinates(geometry.coordinates)
            : MAP_VIEW_HELPERS.roundCoordinates(coordinate),
        },
        __type: 'feature'
      },
    };
    const user = this.context.sandbox.context.user;
    const sandbox = new Sandbox({ user, uiObject });

    return { sandbox };
  }

  componentDidMount() {
    this.setContent(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps)
  }

  setContent(props = {}) {
    const node = ReactDOM.findDOMNode(this);

    this.setState({
      style: {
        position: 'absolute',
        top: props.y - node.clientHeight,
        left: props.x,
        opacity: 1,
      },
    });
  }

  renderHeader() {
    return (
      <div className="mapbox-tooltip-header">
        {this.renderTitle()}
        {this.renderDescription()}
      </div>
    );
  }

  renderTitle() {
    const { data = {} } = this.props;
    const { geometry = {} } = data;

    let title = geometry.type;
    if (data.cluster) title = 'Cluster';
    if (data.segment) title = 'Segment';

    return (
      <div className="mapbox-tooltip-title" style={{ fontWeight: 'bold' }}>
        {title}
      </div>
    );
  }

  renderDescription() {
    const { data = {} } = this.props;
    const { properties = {} } = data;

    let description = properties['p-name'];

    if (data.cluster || data.segment) header = `Size: ${point_count}`;

    return (
      <div className="mapbox-tooltip-description">
        {description}
      </div>
    );
  }

  renderActionsBar() {
    if (!this.props.actions.length) return;

    return (
      <div className="mapbox-tooltip-actions" style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
        <ActionsBar
          model={this.props.model}
          actions={this.props.actions}
          handleAction={this.props.handleAction}
          context={this.props.context}
          visibleActionsLength={VISIBLE_ACTIONS_LENGTH}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="mapbox-tooltip" style={this.state.style}>
        {this.renderHeader()}
        {this.renderActionsBar()}
      </div>
    );
  }
}
