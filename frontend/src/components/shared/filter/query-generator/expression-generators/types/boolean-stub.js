export default (field, operator, value) => {
  return (field.alias === 'true' ? 'TRUE' : 'FALSE');
};
