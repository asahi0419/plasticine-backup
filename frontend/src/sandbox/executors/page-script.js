import PlasticineApi from '../../api';
import { processResponse } from '../../actions/view/actions';

const React = require('react');
const lodash = require('lodash');
const qs = require('qs');
const bodyScrollLock = require('body-scroll-lock');

const store = require('../../store').default;
const history = require('../../history').default;
const helpers = require('../../helpers');

const COMPONENTS = {
  Link: require('react-router').Link,
  Message: require('semantic-ui-react').Message,
  Header: require('semantic-ui-react').Header,
  Form: require('semantic-ui-react').Form,
  Button: require('semantic-ui-react').Button,
  Divider: require('semantic-ui-react').Divider,
  Grid: require('semantic-ui-react').Grid,
  Input: require('semantic-ui-react').Input,
  Checkbox: require('semantic-ui-react').Checkbox,
  Dropdown: require('semantic-ui-react').Dropdown,
  List: require('semantic-ui-react').List,
  DropdownNestable: require('../../components/shared/nestable-dropdown').default,
  Menu: require('semantic-ui-react').Menu,
  Icon: require('semantic-ui-react').Icon,
  Modal: require('semantic-ui-react').Modal,
  Table: require('semantic-ui-react').Table,
  Filter: require('../../components/shared/filter').default,
  Tabs: require('../../components/shared/tabs').default,
  DoubleSidedSelect: require('../../components/shared/selectable/double-sided-select').default,
  MixSelect: require('../../components/shared/selectable/mix-select').default,
  ObjectEditor: require('../../components/shared/object-editor').default,
  RadioTable: require('../../components/shared/tables/radio').default,
  Recaptcha: require('react-grecaptcha').default,
  MaskInput: require('react-maskinput').default,
  ThemeSwitcherContainer: require('../../containers/theme-switcher').default,
  SystemSidebar: require('../../components/sidebar/system').default,
  UserSidebar: require('../../components/sidebar/user').default,
  Loader: require('../../components/shared/loader').default,
  Background: require('../../components/background').default,
  CustomEditorJS: require('../../components/shared/editor-js').default,
  Manager: {
    Appearance: require('../../components/content/form/managers/appearance').default,
    Filter: require('../../components/content/form/managers/filter').default,
    Permission: require('../../components/content/form/managers/permission').default,
    Layout: require('../../components/content/form/managers/layout').default,
    UserSidebar: require('../../components/content/form/managers/user-sidebar').default,
  },
};

export default class PageTemplateExecutor {
  constructor(context) {
    this.component = context.component;
  }

  perform(script = '') {
    script = script.replaceAll('/*#__PURE__*/\n', '').replaceAll('/*#__PURE__*/', '');

    if (script.startsWith('var') || script.startsWith('function ownKeys')) {
      script = lodash.map(script.split('\n'), (line) => {
        return line.startsWith('__COMPONENT__') ? `return ${line}` : line;
      }).join('\n');
    } else {
      script = `return ${script}`;
    }

    const wrappedCode = `const { ${Object.keys(COMPONENTS).join(', ')} } = components; ${script}`;
    const Template = new Function(
      'React',
      'PlasticineApi',
      'processResponse',
      'lodash',
      'qs',
      'bodyScrollLock',
      'store',
      'history',
      'helpers',
      'components',
      'page',
      'p',
      wrappedCode
    );

    return Template(
      React,
      PlasticineApi,
      processResponse,
      lodash,
      qs,
      bodyScrollLock,
      store.redux.instance,
      history,
      helpers,
      COMPONENTS,
      this.component,
      this.component.api,
    );
  }
}
