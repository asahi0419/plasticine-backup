import db from '../../../../../../data-layer/orm/index.js';

export default () => db.client.transaction();
