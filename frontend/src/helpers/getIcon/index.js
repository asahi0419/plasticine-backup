import mapping from './mapping';

export default (type, ext, name) => {
  return mapping[type][ext][name];
};
