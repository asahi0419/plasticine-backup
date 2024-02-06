import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { map } from 'lodash/collection';
import Header from "../../../../../shared/header";

export default class Column extends Component {
  static propTypes = {
    components: PropTypes.array.isRequired,
    elementRenderer: PropTypes.func.isRequired,
    embeddedViewRenderer: PropTypes.func.isRequired,
    params: PropTypes.object,
    width: PropTypes.string.isRequired,
    minWidth: PropTypes.string,
    maxWidth: PropTypes.string,
  }

  getMaxWidth = () => {
    const { params: { max_width } } = this.props;
    if (!max_width) return;
    return Number(max_width) ? max_width + 'px' : max_width;
  }

  renderColumnLabel = () => {
    const { params = {} } = this.props;
    if (!params.name) return null;

    return (<Header {...params} />);
  }

  renderComponent = (component, i) => {
    const { components, elementRenderer } = this.props;
    const element = elementRenderer(component);
    const { id = '' } = components[i + 1] || {};

    const classNameSC = id.match(/__section__|data_visual/) ? ' section-component' : '';
    const className = `form-section-column-component${classNameSC}`;

    return <div key={i} className={className}>{element}</div>;
  }

  render() {
    const { components, width, minWidth, maxWidth, params, embeddedViewRenderer } = this.props;
    const style = {
      width,
      minWidth,
      maxWidth: this.getMaxWidth() || maxWidth,
    };

    return (
      <Grid.Column style={style}>
        {this.renderColumnLabel()}
        {components.map(this.renderComponent)}
        {params.embedded_view && embeddedViewRenderer(params.embedded_view)}
      </Grid.Column>
    );
  }
}
