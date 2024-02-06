import parseFilter, { preprocessInput } from '../parser.js';

describe('Filter parser', () => {
  test('It should parse simple expression', () => {
    const astTree = parseFilter("`type` = 'string'");

    expect(astTree.type).toBe('binary_expr');
    expect(astTree.operator).toBe('=');
    expect(astTree.left.column).toBe('type');
    expect(astTree.right.value).toBe('string');
  });
});

describe('preprocessInput(expression)', () => {
  it('Should return correct result', () => {
    let result, expected;

    result = preprocessInput("`string` = 'string'");
    expected = "`string` = 'string'";
    expect(result).toEqual(expected);

    result = preprocessInput("`string` = 'string' OR `string` = 'string'");
    expected = "`string` = 'string' OR `string` = 'string'";
    expect(result).toEqual(expected);

    result = preprocessInput("`string` = 'js:'");
    expected = "`string` = ('js:')";
    expect(result).toEqual(expected);

    result = preprocessInput("`string` = 'js:' OR `string` = 'js:'");
    expected = "`string` = ('js:') OR `string` = ('js:')";
    expect(result).toEqual(expected);

    result = preprocessInput("`string` = 'js:null'");
    expected = "`string` = ('js:null')";
    expect(result).toEqual(expected);

    result = preprocessInput("`string` = 'js:null' OR `string` = 'js:null'");
    expected = "`string` = ('js:null') OR `string` = ('js:null')";
    expect(result).toEqual(expected);

    result = preprocessInput("`string` = 'js:\"string\"'");
    expected = "`string` = ('js:\"string\"')";
    expect(result).toEqual(expected);

    result = preprocessInput("`string` = 'js:\"string\"' OR `string` = 'js:\"string\"'");
    expected = "`string` = ('js:\"string\"') OR `string` = ('js:\"string\"')";
    expect(result).toEqual(expected);

    result = preprocessInput("`id` IN 'js:await redisCache.useFilterForUsers(\"external_users\", p.currentUser.getValue(\"id\"))'");
    expected = "`id` IN ('js:await redisCache.useFilterForUsers(\"external_users\", p.currentUser.getValue(\"id\"))')";
    expect(result).toEqual(expected);
  });
});
