import actionsNamespace from '../actions/index.js';

describe('p.actions', () => {
  it('Should return actions proxy instance', () => {
    const context = { response: {}, request: {} };

    const result = actionsNamespace(context, sandbox);

    expect(typeof result.downloadFile).toEqual('function');
    expect(typeof result.goBack).toEqual('function');
    expect(typeof result.logout).toEqual('function');
    expect(typeof result.openForm).toEqual('function');
    expect(typeof result.openPage).toEqual('function');
    expect(typeof result.openURL).toEqual('function');
    expect(typeof result.openView).toEqual('function');
    expect(typeof result.showMessage).toEqual('function');
  });
});
