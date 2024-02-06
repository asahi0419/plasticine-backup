import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router';
import { isEqual } from 'lodash/lang';
import { sum } from 'lodash/math';

import Preview from './preview';
import EmbeddedView from '../../view/embedded';
import { makeUniqueID, downloadAttachment } from '../../../../helpers';

const itemQuickAction = (model, record) => {
  const style = { cursor: 'pointer' };
  const onClick = () => downloadAttachment(record);

  return (
    <Link onClick={onClick} style={style}>
      <Icon name='download' color='black' />
    </Link>
  );
};

export default class AttachmentsManager extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    handleAction: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    editable: PropTypes.bool.isRequired,
    syncCount: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedAttachment: null,
      recordId: props.record.id,
      hash: props.hash,
      counts: {},
    };
  }

  componentWillMount() {
    const { model, record } = this.props;

    this.statusUploadingToken = PubSub.subscribe(`background.status.uploading.${model.id}.${record.id}`, (_, status) => {
      if (status === 'finished') this.setState({ hash: `#${makeUniqueID()}` });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.hash, nextProps.hash)) {
      this.setState({ hash: nextProps.hash });
    }
    if (!isEqual(this.props.recordId, nextProps.record.id)) {
      this.setState({ recordId: nextProps.record.id });
    }
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.statusUploadingToken);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextState, this.state);
  }

  handleChooseAttachment = ({ record }) => {
    this.setState({ selectedAttachment: record });
  }

  getSyncCount = (view) => (count) => {
    const counts = { ...this.state.counts, [view.alias]: count };
    const newCount = sum(Object.values(counts));
    const selectedAttachment = isEqual(this.state.counts, counts) ? this.state.selectedAttachment : null;

    this.props.syncCount(newCount);
    this.setState({ counts, selectedAttachment });
  };

  getParams = (view) => {
    const { model, record } = this.props;
    const filter = `target_record = '${[model.id, record.id].join('/')}'`;

    return {
      hidden_filter: view.filter ? `(${view.filter}) AND ${filter}` : filter,
      embedded_to: { container: 'form', model: model.alias, record_id: record.id },
      exec_by: { type: 'attachment_view', alias: view.alias },
    };
  }

  renderView(view) {
    const props = {
      hash: this.state.hash,
      context: 'attachment_view',
      modelAlias: 'attachment',
      viewAlias: view.alias,
      params: this.getParams(view),
    };

    const configs = {
      withCache: this.props.withCache,
      withCellEdit: this.props.editable,
      showHeaderActions: this.props.enabled,
      withFirstCellLink: false,
    };

    const callbacks = {
      syncCount: this.getSyncCount(view),
      onItemClick: this.handleChooseAttachment,
      handleAction: this.props.handleAction,
      itemQuickAction,
    };

    return (
      <EmbeddedView
        props={props}
        configs={configs}
        callbacks={callbacks}
      />
    );
  }

  renderPerview() {
    if (!this.state.selectedAttachment) return;

    const attachment = this.state.selectedAttachment;
    const onClose = () => this.setState({ selectedAttachment: null });

    return <Preview attachment={attachment} onClose={onClose} />;
  }

  render() {
    const { config = {} } = this.props;
    const { last_versions_view, previous_versions_view } = config;

    return (
      <div className="attachments-manager" style={{ position: 'relative' }}>
        {last_versions_view && this.renderView(last_versions_view)}
        {previous_versions_view && this.renderView(previous_versions_view)}
        {this.renderPerview()}
      </div>
    );
  }
}
