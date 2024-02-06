
export default (field, operator, value) => {
  switch (operator) {
    case 'belongs_to_group':
    case 'does_not_belongs_to_group':
      const notSymbol = operator === 'does_not_belongs_to_group' ? '!' : '';
      return `${notSymbol}p.currentUser.isBelongsToWorkgroup(${value})`;
    case 'has_administrator_privilege':
      return `p.currentUser.isAdmin()`;
    case 'has_read_privilege':
      return `p.currentUser.canAtLeastRead()`;
    case 'has_read_write_privilege':
      return `p.currentUser.canAtLeastWrite()`;
  }
};
