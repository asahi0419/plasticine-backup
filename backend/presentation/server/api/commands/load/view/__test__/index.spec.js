import loadView from '../index.js';

jest.mock('../../../../../../../data-layer/orm/index.js', () => ({
  getModel: jest.fn().mockReturnValue({}),
  model: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({
      getOne: jest.fn().mockReturnValue({}),
      select: jest.fn().mockReturnValue([]),
    }),
  }),
}));

jest.mock('../../helpers/index.js', () => ({
  serializer: jest.fn().mockReturnValue([{ test: 'test' }]),
  loadFields: jest.fn(),
}));

jest.mock('../helpers', () => {
  const mckLoadResourceWithUserSettings = jest.fn()
    .mockReturnValueOnce([ { type: 'grid' }, true ])
    .mockReturnValueOnce([false, true]);

  return {
    loadTemplates: jest.fn().mockReturnValue([{ templates: 'templates' }]),
    loadResourceWithUserSettings: mckLoadResourceWithUserSettings,
  };
});

jest.mock('../grid', () => jest.fn().mockReturnValue([{ data: 'data' }]));

const executeScript = jest.fn().mockReturnValue(true);

const res = {
  json: jest.fn().mockImplementation((data) => data),
  error: jest.fn().mockImplementation(() => 'error'),
};

const req = {
  sandbox: {
    executeScript,
  },
  params: {},
  query: {},
  model: {},
};


describe('View loader index', async () => {
  // it('It should return correct data', async () => {
  //   await loadView(req, res);
  //   const expected = {
  //     data: [{ data: 'data' }],
  //     meta: {
  //       templates: [{ templates: 'templates' }],
  //     },
  //   };
  //
  //   expect(res.json).toBeCalled();
  //   expect(res.json).toBeCalledWith(expected);
  // });

  it('It should throw an error when view not found', async () => {
    await loadView(req, res);

    expect(res.error).toBeCalled();
  });

});
