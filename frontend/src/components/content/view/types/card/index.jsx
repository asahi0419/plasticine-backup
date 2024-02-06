import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { keyBy } from 'lodash/collection';
import { isEqual } from 'lodash/lang';

import Grid from './grid';
import Carousel from './carousel';
import { createLayout } from './helpers';
import { parseOptions } from '../../../../../helpers';

const ViewCardStyled = styled.div`
  overflow: hidden;

  .view-card-body {
    position: relative;
  }
`;

export default class ViewCard extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      fields: PropTypes.array.isRequired,
      view: PropTypes.object.isRequired,
      layout: PropTypes.object.isRequired,
      actions: PropTypes.array.isRequired,
      records: PropTypes.array.isRequired,
      viewOptions: PropTypes.object.isRequired,
    }),

    callbacks: PropTypes.shape({
      handleAction: PropTypes.func.isRequired,
      updateView: PropTypes.func.isRequired,
      updateUserSettings: PropTypes.func.isRequired,
      onItemClick: PropTypes.func,
      syncCount: PropTypes.func,
    }),
  }

  static contextTypes = {
    form: PropTypes.object,
  }

  constructor(props) {
    super(props);

    const layoutOptions = parseOptions(props.props.layout.options);
    this.layout = { ...layoutOptions, components: createLayout(layoutOptions.components) };
    this.state = {
      records: props.props.records,
      viewOptions: props.props.viewOptions,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children) return;

    if (!isEqual(this.props.props.records, nextProps.props.records)) {
      this.setState({ records: nextProps.props.records });
    }

    if (!isEqual(this.props.props.viewOptions, nextProps.props.viewOptions)) {
      this.setState({ viewOptions: nextProps.props.viewOptions });
    }
  }

  renderNotFound = () => (
    <div style={{ marginBottom: '15px' }}>
      {i18n.t('records_not_found', { defaultValue: 'Records not found' })}
    </div>
  );

  renderBody = () => {
    const { model, actions, fields, view, viewOptions } = this.props.props;
    const { handleAction, onItemClick } = this.props.callbacks;
    const { records = [] } = this.state;

    if (records.length) {
      const { card_style: { show_as_carousel } } = this.layout;
      const TagName = show_as_carousel ? Carousel : Grid;

      return (
        <div className="view-card-body">
          <TagName
            view={{ ...view, __metadata: { ...view.__metadata, form: this.context.form }}}
            layout={this.layout}
            records={records}
            model={model}
            fields={fields}
            actions={actions}
            handleAction={handleAction}
            page={viewOptions.page}
            onItemClick={onItemClick}
          />
          {this.props.children}
        </div>
      );
    }

    return <div>{i18n.t('records_not_found', { defaultValue: 'Records not found' })}</div>
  }

  render() {
    return (
      <ViewCardStyled className="view-card">
        {this.renderBody()}
      </ViewCardStyled>
    );
  }
}
