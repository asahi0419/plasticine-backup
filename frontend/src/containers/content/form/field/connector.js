import { get } from 'lodash/object';
import { connect } from 'react-redux';

import selectField from '../../../../selectors/field';
import { loadField } from '../../../../actions/db';
import { openField, closeField } from '../../../../actions/view/field';

function mapStateToProps(state, props) {
  const field = state.view.field[props.field.id] || {};
  if (!field.ready) return { ready: false };

  const configs = get(state.app.components, `configs.${props.field.type}_field`) || {};
  const metadata = state.metadata[`${props.model.alias}/field/${props.field.alias}`];
  const result = selectField(metadata, props.model.alias, props.field, field.params);

  return { ready: true, configs, ...result };
}

export default (component) => connect(mapStateToProps, { loadField, openField, closeField })(component);
