import history from '../../../history';
import { openFileDialog, copyToClipboard } from '../../../helpers';

export default () => {
  return {
    showMessage: (message) => PubSub.publish('messages', message),
    switchDashboardMode: (mode) => PubSub.publish('switch_dashboard_mode', mode),
    switchLayoutMode: (mode) => PubSub.publish('switch_layout_mode', mode),
    openURL: (url) => (location.href = url),
    openView: (modelAlias, viewAlias, options = {}, parent) => PubSub.publish('modal', { modelAlias, viewAlias, target: 'view', options, parent }),
    goBack: () => history.goBack(),
    openFileDialog,
    copyToClipboard,
  };
};
