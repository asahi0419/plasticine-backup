export function getPageNumber(value) {
  let result = parseInt(value);
  if (result < 1) result = 1;
  return result;
};

export function getPageSize(value) {
  let result = parseInt(value);
  if (result < 0) result = 0;
  return result;
};
