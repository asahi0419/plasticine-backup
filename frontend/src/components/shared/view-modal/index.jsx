import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dropdown, Divider } from 'semantic-ui-react';
import { map, filter, find, reduce, orderBy } from 'lodash/collection';

import Tabs from '../tabs';
import Modal from '../modal';
import Sandbox from '../../../sandbox';
import EmbeddedView from '../../content/view/embedded';
import { handleAction } from '../../../actions/view/actions';
import { getModel } from '../../../helpers';
import store from '../../../store';

class ViewModal extends Component {
  static propTypes = {
    modelAlias: PropTypes.string,
    viewAlias: PropTypes.string,
    opened: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onChoose: PropTypes.func,
    user: PropTypes.object.isRequired,
    actions: PropTypes.array,
    handleAction: PropTypes.func.isRequired,
    selectable: PropTypes.bool,
    rowselect: PropTypes.bool,
    withHeaderMenu: PropTypes.bool,
    showModelName: PropTypes.bool,
    references: PropTypes.array,
    fullMode: PropTypes.bool,
    options: PropTypes.object,
    parent: PropTypes.object,
  }

  static childContextTypes = {
    componentsCache: PropTypes.object,
    sandbox: PropTypes.object,
  }

  static contextTypes = {
    sandbox: PropTypes.object,
  }

  static defaultProps = {
    options: {},
    actions: [],
    onChoose: () => null,
  }

  constructor(props) {
    super(props);

    this.state = {};

    if (props.options.type === 'global_reference_view') {
      if (props.references.length) {
        const [ activeView ] = map(props.references, (reference, key) => key);
        this.state.activeView = activeView;
      } else {
        const app = store.redux.state('metadata.app');

        for (let model of orderBy(app.model, 'name')) {
          const view = find(app.view, { model: model.id, type: 'grid' });

          if (view) {
            this.state.activeView = view;
            break;
          }
        }

      }
    }
  }

  getChildContext() {
    const { user, options, onClose } = this.props;
    const { this: parent } = this.context.sandbox.getContext();
    const uiObject = { attributes: { __type: 'view' }, options: { ...options, onClose }, parent };

    return {
      componentsCache: {},
      sandbox: new Sandbox({ user, uiObject }),
    }
  }

  renderView(modelAlias, viewAlias, onItemClick, filter) {
    const { options } = this.props;

    const params = {
      exec_by: {
        ...options,
        alias: viewAlias,
        parent: this.props.parent,
      }
    };

    if (filter) params.hidden_filter = filter;
    if (options.filter) params.hidden_filter = options.filter;
    if (options.page) params.page = options.page;
    if (options.type === 'reference_view' && options.extra_fields) params.extra_fields = options.extra_fields;

    const props = {
      context: params.exec_by.type,
      modelAlias,
      viewAlias,
      params,
      actions: this.props.actions,
      selectedRecords: options.selectedRecords,
    };
    const configs = {
      statical: !this.props.fullMode,
      selectable: this.props.selectable,
      rowselect: this.props.rowselect,
      showModelName: this.props.showModelName,
      showGroupActions: false,
      showFilterManager: this.props.showFilterManager,
      showQuicksearch: this.props.showQuicksearch,
      withPaginator: { position: ['top'] },
      withFirstCellLink: options.type !== 'reference_view'
    };
    const callbacks = {
      handleAction: this.props.handleAction,
      onItemClick,
    };

    return <EmbeddedView props={props} configs={configs} callbacks={callbacks} />;
  }

  renderViewReference(modelAlias, viewAlias) {
    const onItemClick = (option) => {
      this.props.onChoose(null, option);
      this.props.onClose();
    };

    return this.renderView(modelAlias, viewAlias, onItemClick)
  }

  renderViewRTL(modelAlias, viewAlias) {
    return this.renderView(modelAlias, viewAlias)
  }

  renderViewGlobalReference(references = []) {
    const onItemClick = (reference) => (option) => {
      this.props.onChoose(null, option, reference);
      this.props.onClose();
    };

    if (!references.length) {
      const { activeView: view } = this.state;

      const models = store.redux.state('metadata.app').model;
      const views = store.redux.state('metadata.app').view;

      const model = models[view.model];
      const options = reduce(orderBy(models, 'name'), (result, { id, name }) => {
        const v = find(views, { model: id, type: 'grid' });
        if (v) result.push({ key: id, value: id, text: name });
        return result;
      }, []);

      return (
        <div style={{ paddingTop: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '10px' }}>Select a model</div>
            <Dropdown
              search
              selection
              value={model.id}
              options={options}
              onChange={(e, { value }) => {
                this.setState({ activeView: find(views, { model: value, type: 'grid' }) });
              }}
            />
          </div>
          <Divider style={{ marginBottom: 0 }} />
          <div>
            {this.renderView(model.alias, view.alias, onItemClick({
              model: model.alias,
              view: view.alias,
              label: 'id',
            }))}
          </div>
        </div>
      );
    }

    const onSelect = (view) => this.setState({ activeView: view });
    const filteredReferences = filter(references.map((item) => ({ ...item, modelObject: getModel(item.model) })), 'modelObject');

    return (
      <div style={{ paddingTop: '15px' }}>
        <Tabs onSelect={onSelect}>
          {filteredReferences.map(({ model, modelObject, view, label, title, filter }) => (
            <Tabs.Pane key={model} label={title || modelObject.name}>
              {this.renderView(model, view, onItemClick({ model, view, label }), filter)}
            </Tabs.Pane>
          ))}
        </Tabs>
      </div>
    );
  }

  renderContent() {
    const { modelAlias, viewAlias, options, references } = this.props;
    const { type } = options;

    if (type === 'global_reference_view') return this.renderViewGlobalReference(references);
    if (type === 'reference_view') return this.renderViewReference(modelAlias, viewAlias);
    if (type === 'rtl_popup') return this.renderViewRTL(modelAlias, viewAlias);

    return this.renderView(modelAlias, viewAlias);
  }

  render() {
    return (
      <Modal opened={this.props.opened} onClose={() => this.props.onClose()}>
        {this.renderContent()}
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return { user: state.app.user };
}

export default connect(mapStateToProps, { handleAction })(ViewModal);
