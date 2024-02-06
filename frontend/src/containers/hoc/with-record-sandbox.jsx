import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pick, omit } from 'lodash/object';

import store from '../../store';
import Sandbox from '../../sandbox/index';
import ProxyRecord from '../content/form/proxy-record';

export class WithRecordSandboxComponent extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    record: PropTypes.object,
  }

  static childContextTypes = {
    record: PropTypes.object,
    sandbox: PropTypes.object.isRequired,
  }

  static contextTypes = {
    sandbox: PropTypes.object,
  }

  getChildContext() {
    return {
      record: this.record,
      sandbox: this.sandbox,
    };
  }

  constructor(props, context) {
    super(props, context);

    const record = getRecord(props);

    this.record = new ProxyRecord(record.attributes, record.metadata);
    this.sandbox = new Sandbox(getSandboxContext(props, context, this.record));

    if (props.ready) {
      this.record.__assignSandbox(this.sandbox);
      this.record.__executeUiRules();
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.ready && (nextProps.ready !== this.props.ready);
  }

  render() {
    const { children, ready, ...props } = this.props;

    if (ready) {
      const record = getRecord(props);

      this.record.create(record.attributes, record.metadata);
      this.sandbox.create(getSandboxContext(props, this.context, this.record));
      this.record.__assignSandbox(this.sandbox);
      this.record.__executeUiRules();
    }

    return children;
  }
}

export default (ComposedComponent) => {
  return class extends Component {
    static propTypes = {
      record: PropTypes.object.isRequired,
      user: PropTypes.object.isRequired,
    }

    static childContextTypes = {
      record: PropTypes.object.isRequired,
      sandbox: PropTypes.object.isRequired,
    }

    static contextTypes = {
      sandbox: PropTypes.object,
    }

    getChildContext() {
      return {
        record: this.record,
        sandbox: this.sandbox,
      };
    }

    constructor(props, context) {
      super(props, context);

      const record = getRecord(props);

      this.record = new ProxyRecord(record.attributes, record.metadata);
      this.sandbox = new Sandbox(getSandboxContext(props, context, this.record));
      this.record.__assignSandbox(this.sandbox);
      this.record.__executeUiRules();
    }

    componentWillReceiveProps(nextProps) {
      if (!getReady()) return;

      const record = getRecord(nextProps);

      this.record.create(record.attributes, record.metadata);
      this.sandbox.create(getSandboxContext(nextProps, this.context, this.record));
      this.record.__assignSandbox(this.sandbox);
      this.record.__executeUiRules();
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }
};

function getReady() {
  const result = store.redux.state('view.content.ready');

  return result;
}

export function getRecord(props = {}) {
  const { record = {} } = props;

  const attributes = omit(record, ['__metadata']);
  const metadata = {
    ...(record.__metadata || {}),
    ...pick(props, ['model', 'fields', 'form', 'view', 'actions', 'uiRules', 'extraFieldsAttributes']),
  };

  return { attributes, metadata };
}

function getSandboxContext(props = {}, context, record) {
  const user = props.user;
  const uiObject = getUIObject(props, context, record)

  return { record, user, uiObject };
}

function getUIObject(props = {}, context = {}, record = {}) {
  const { callbacks = {} } = props;
  const { sandbox } = context;

  const { metadata: { form, view } } = record;
  const { onClose } = callbacks;

  const parent = sandbox ? sandbox.getContext().this : undefined;

  if (form) {
    return {
      attributes: { ...form, __type: 'form' },
      options: { ...form.__metadata.params, onClose },
      parent,
    }
  } else if (view && view.type === 'card') {
    return {
      attributes: { __type: 'card' },
      options: {},
      parent,
    }
  }
}
