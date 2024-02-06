import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Sandbox from '../../../sandbox';
import EmbeddedView from '../view/embedded';

export default class FormEmbeddedView extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    enabled: PropTypes.bool,
    statical: PropTypes.bool,
    handleAction: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    parent: PropTypes.object,
  }

  static contextTypes = {
    sandbox: PropTypes.object,
  }

  static childContextTypes = {
    sandbox: PropTypes.object,
  }

  static defaultProps = {
    enabled: true,
    statical: false,
  }

  getChildContext() {
    return {
      sandbox: this.sandbox,
    };
  }

  constructor(props, context) {
    super(props, context);

    const sandboxContext = getSandboxContext(props, context);
    this.sandbox = new Sandbox(sandboxContext);
  }

  componentWillReceiveProps(nextProps) {
    const sandboxContext = getSandboxContext(nextProps, this.context);
    this.sandbox = new Sandbox(sandboxContext);
  }

  render() {
    const { options = {}, handleAction, type, enabled, statical } = this.props;

    const props = {
      context: type,
      modelAlias: options.model?.alias,
      viewAlias: options.view?.alias,
      params: getParams(this.props),
    };

    if (options.field && options.field.alias) {
      props.fieldAlias = options.field.alias;
    }

    const configs = {
      showModelName: false,
      showHeaderActions: enabled,
      statical,
    };

    const callbacks = {
      handleAction
    };

    return (
      <div className="form-view-embedded">
        <EmbeddedView props={props} configs={configs} callbacks={callbacks} />
      </div>
    );
  }
}

function getSandboxContext(props, context) {
  const { this: parent, currentUser: { user } } = context.sandbox.getContext();
  const { options: { field, view }, type } = props;
  const options = type === 'rtl' ? { ...getParams(props), field } : getParams(props);

  const uiObject = {
    attributes: { ...view, __type: 'view' },
    options,
    parent,
  };

  return { user, uiObject };
}

function getParams(props) {
  const { options: { field, view = {} }, type, parent, model, record } = props;
  const embedded_to = { container: 'form', model: model.alias, model_id: model.id, record_id: record.id };
  if (type === 'rtl') embedded_to.field = field.alias;

  return {
    filter: view.filter,
    hidden_filter: getHiddenFilter(props),
    exec_by: { type, alias: view.alias, name: view.name, parent },
    embedded_to,
    ids: getIds(props),
  };
}

function getHiddenFilter(props) {
  const { options: { field, type }, type: viewType, model, record } = props;
  if (type === 'any_model') return;

  if (field && field.type === 'reference_to_list') {
    if (viewType === 'rtl') {
      // return `(RTL_VIEW_FILTER ${field.id} ${record.id})`; // https://redmine.nasctech.com/issues/65213
      const ids = getIds(props);
      return `\`id\` IN (${ids.length ? ids.join(',') : -1})`;
    } else {
      return `\`${field.alias}\` IN (${record.id})`
    }
  }

  const column = field ? field.alias : 'id';
  const value = field && field.type === 'global_reference' ? `'${model.id}/${record.id}'` : record.id;

  return (props.options.model === 'attachment')
    ? `(\`${column}\` = ${value}) AND (target_record = '${[model.id, record.id].join('/')}')`
    : `\`${column}\` = ${value}`;
}

function getIds(props) {
  const { options: { field }, record } = props;

  if (field && field.type === 'reference_to_list') {
    return record[field.alias] || [];
  }

  return [];
}
