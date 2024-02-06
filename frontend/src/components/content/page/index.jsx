import Promise from 'bluebird';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isUndefined } from 'lodash/lang';
import { reduce, each } from 'lodash/collection';

import Sandbox from '../../../sandbox';
import PlasticineApi from '../../../api';
import * as CONSTANTS from '../../../constants';
import * as HELPERS from '../../../helpers';
import { injectClientScript, wrapAction } from './helpers';

const StylingWrapper = styled.div`
  height: 100%;

  ${({ pageStyles }) => pageStyles}

  ${({ propStyles = {} }) => {
    const styles = [];

    if (!isUndefined(propStyles.top)) styles.push(`top: ${propStyles.top};`);
    if (!isUndefined(propStyles.left)) styles.push(`left: ${propStyles.left};`);
    if (!isUndefined(propStyles.width)) styles.push(`width: ${propStyles.width} !important;`);
    if (!isUndefined(propStyles.height)) styles.push(`height: ${propStyles.height};`);
    if (!isUndefined(propStyles.marginTop)) styles.push(`margin-top: ${propStyles.marginTop};`);
    if (!isUndefined(propStyles.zIndex)) styles.push(`z-index: ${propStyles.zIndex};`);
    if (!isUndefined(propStyles.filter)) styles.push(`filter: ${propStyles.filter};`);
    if (!isUndefined(propStyles.pointerEvents)) styles.push(`pointer-events: ${propStyles.pointerEvents};`);

    return styles.join('\n');
  }}
`;
export default class Page extends Component {
  static propTypes = {
    page: PropTypes.object.isRequired,
    theme: PropTypes.object,
    sandbox: PropTypes.object.isRequired,
    variables: PropTypes.object,
    actions: PropTypes.array,
    attachments: PropTypes.array,
    handleAction: PropTypes.func.isRequired,
  }

  static defaultProps = {
    actions: [],
    attachments: [],
    variables: {},
  };

  constructor(props) {
    super(props);

    this.state = { loaded: false, variables: props.variables };
    injectClientScript(this);
  }

  async componentWillMount(...args) {
    if (this.__componentWillMount) {
      await this.__componentWillMount(...args);
    }
  }

  async componentDidMount(...args) {
    const { page, handleAction } = this.props;

    const uiObject = {
      attributes: { __type: 'page' },
      options: {},
      parent: (this.props.sandbox.getContext()).this,
    };
    const sandbox = new Sandbox({ uiObject })

    const actions = reduce(this.props.actions, (result, item) => {
      result[item.alias] = wrapAction(item, handleAction, sandbox, { page });
      return result;
    }, {});

    const attachments = await Promise.reduce(this.props.attachments, async (result, item) => {
      try {
        result[item.file_name] = await HELPERS.attachmentToDataURL(item);
      } catch (error) {

      }
      return result;
    }, {});

    this.api.this = sandbox.api.p.this
    this.api.setProps({ actions, attachments });
    this.setState({ loaded: true });

    if (this.__componentDidMount) {
      await this.__componentDidMount(...args);
    }
  }

  async componentWillReceiveProps(nextProps) {
    this.setState({ variables: nextProps.variables });

    if (this.__componentWillReceiveProps) {
      await this.__componentWillReceiveProps(nextProps);
    }
  }

  async componentWillUnmount(...args) {
    if (this.__componentWillUnmount) {
      await this.__componentWillUnmount(...args);
    }
  }

  updateUserSetting = async (options = {}) => {
    await PlasticineApi.updateUserSettings('page', this.props.page.id, { options });
  }

  interpolateThemeStyles = (theme = {}, styles) => {
    const props = ((styles || '').match(/\{\w+\}/g) || []).map(part => part.slice(1, -1));

    each(props, (prop) => {
      styles = styles.replace(`{${prop}}`, theme[prop] || CONSTANTS[prop]);
    });

    return styles;
  }

  renderError = (error) => {
    return (
      <div>
        <span><strong>Error!</strong> {error}</span>
      </div>
    );
  }

  render() {
    if (!this.state.loaded) return null;

    let { page, theme, error } = this.props;
    let template = {};

    const pageTemplateSandbox = new Sandbox({ component: this }, 'page_script');

    try {
      template = pageTemplateSandbox.executeScript(page.template, {}, `page/${page.id}/template`);
    } catch (err) {
      console.error(err);
      error = err.message;
    }

    const pageStyles = this.interpolateThemeStyles(theme, page.styles);
    const propStyles = this.props.styles;

    return (
      <StylingWrapper pageStyles={pageStyles} propStyles={propStyles} className="page">
        {error ? this.renderError(error) : template}
      </StylingWrapper>
    );
  }
}
