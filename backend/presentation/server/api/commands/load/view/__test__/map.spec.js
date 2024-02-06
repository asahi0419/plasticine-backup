import loadMap from '../map.js';

jest.mock('../../helpers/index.js', () => {
  const mckSerializer = jest.fn().mockReturnValue({ test: 'test' });
  return {
    serializer: mckSerializer,
    loadFields: jest.fn(),
  };
});

jest.mock('../helpers', () => ({
  loadFilters: jest.fn(),
  loadActions: jest.fn(),
}));


describe('View loader map', async () => {
  it('It should return correct data', async () => {
    const mockFuncResult = { test: 'test' };
    const loaderData = await loadMap({}, {}, {});
    const expected = [ {}, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult ];

    expect(loaderData).toEqual(expected);
  });
});
