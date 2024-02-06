export default (field, operator, value) => {
  if (!value) value = 'js:';
  return `TRUE = '${value}'`;
};
