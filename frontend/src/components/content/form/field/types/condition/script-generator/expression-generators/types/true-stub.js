export default (field, operator, value) => {
  return `(${value.replace(/^js:/, '')})`;
};
