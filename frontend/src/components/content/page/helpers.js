import { each } from 'lodash/collection';

import PageApi from './api';
import Sandbox from '../../../sandbox';

export const injectClientScript = (component, props = {}) => {
  component.api = new PageApi(component, props);

  const pageScriptSandbox = new Sandbox({ component }, 'page_script');

  const { page } = component.props;

  if (page.component_script) {
    each(pageScriptSandbox.executeScript(page.component_script, {}, `page/${page.id}/component_script`), (func, name) => {
      if (['componentWillMount', 'componentDidMount', 'componentWillReceiveProps', 'componentWillUnmount'].includes(name)) {
        name = `__${name}`;
      }
      component[name] = func;
    });

    if (component.initState) {
      component.state = Object.assign({}, component.state, component.initState());
    }
  }
};

export const wrapAction = (action, handler, sandbox, { page }) => {
  return async (params, callback) => {
    const result = sandbox.executeScript(
      action.client_script || 'true',
      { modelId: action.model },
      `action/${action.id}/client_script`
    )

    if (result) {
      const model = { alias: 'page' };
      const options = {
        ...params,
        sandbox,
        record: { id: page.id },
        exec_by: { type: 'page', alias: page.alias },
      };

      const result = await handler(model, action, options);
      if (callback) await callback(result);
    }
  };
}
