export default (field) => {
  return (value) => {
    return [true, false].includes(value)
      ? (value ? 'Yes' : 'No')
      : 'No'
  };
}
