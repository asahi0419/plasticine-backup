
export default (sandbox) => () => {
  const request = sandbox.vm.p.getRequest();
  const { client } = request;
  if (client && (client === 'mobile')) {
    return 'client';
  }
  return 'portal';
};
