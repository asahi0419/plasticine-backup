import loadGrid from '../grid.js';

jest.mock('../../helpers/index.js', () => {
  const mckSerializer = jest.fn().mockReturnValue({ test: 'test' });
  return {
    serializer: mckSerializer,
    loadFields: jest.fn(),
  };
});

jest.mock('../helpers', () => {
  const mckLoadResourceWithUserSettings = jest.fn()
    .mockReturnValueOnce([true, true])
    .mockReturnValueOnce([true, false]);
  return {
    loadFilters: jest.fn(),
    loadActions: jest.fn(),
    loadResourceWithUserSettings: mckLoadResourceWithUserSettings,
  };
});


describe('View loader grid', async () => {
  it('It should return correct data when userSetting = true', async () => {
    const mockFuncResult = { test: 'test' };
    const loaderData = await loadGrid({}, {}, {});
    const expected = [ {}, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult ];

    expect(loaderData).toEqual(expected);
  });

  it('It should return correct data when userSetting = false', async () => {
    const mockFuncResult = { test: 'test' };
    const loaderData = await loadGrid({}, {}, {});
    const expected = [ {}, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult, mockFuncResult ];

    expect(loaderData).toEqual(expected);
  });
});
