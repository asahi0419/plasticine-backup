import { connect } from 'react-redux';
import { isEmpty } from 'lodash/lang';
import { pick } from 'lodash/object';

import selectView from '../../../selectors/view';
import { loadView } from '../../../actions/db';
import { openView, closeView, exportView } from '../../../actions/view/view';
import { handleAction } from '../../../actions/view/actions';

function mapStateToProps(state) {
  const { view = {}, app = {}, db } = state;
  const { content = {} } = view;
  const { user } = app

  const { ready, params = {}, model: modelAlias } = content;
  const { viewAlias, viewOptions = {}, recordsIds } = params;

  const metadata = state.metadata[`${modelAlias}/view/${viewAlias}`];
  const viewProps = selectView(db, metadata, modelAlias, recordsIds);
  const loaded = !isEmpty(viewProps);

  return { loaded, ready, viewOptions, viewProps, user };
}

export default (component) => connect(mapStateToProps, {
  loadView,
  openView,
  closeView,
  exportView,
  handleAction,
})(component);
