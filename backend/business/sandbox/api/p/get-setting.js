import cache from '../../../../presentation/shared/cache/index.js';
import { extractSetting } from '../../../setting/index.js';

export default (input) => extractSetting(cache.namespaces.core.get('settings'), input);
