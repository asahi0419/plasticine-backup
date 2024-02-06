import lodash from 'lodash'
// import Sandbox from '../../../sandbox';

import compileFilter from '../';

const Sandbox = ({ record, fields }) => {
  return {
    executeScript: (script) => {
      const p = {
        record: {
          getValue: (alias) => record[alias],
          getField: (alias) => lodash.find(fields, { alias })
        }
      }
      const scriptBody = `return ${script}`
      return new Function('p', scriptBody)(p)
    }
  }
}

describe('Helpers', () => {
  describe('compileFilter(filter, options)', () => {
    it('Should return compiled filter with operator between and preserved functions', async () => {
      const record = {
        integer: 1,
      };
      const fields = [
        { alias: 'integer', type: 'integer' },
      ]
      
      const sandbox = Sandbox({ record, fields });
      const options = { sandbox }

      let filter = `integer BETWEEN 'js:func("1")' AND 'js:func("1")'`;
      let result = await compileFilter(filter, options);
      let expected = `integer BETWEEN 'js:func("1")' AND 'js:func("1")'`;
      expect(result).toEqual(expected);
    });

    it('Should return compiled filter by source record', async () => {
      const record = {
        string: 'string',
        integer: 1,
        ar: 'a',
        arms: ['a', 'b'],
        rtl: [1, 2],
      };
      const fields = [
        { alias: 'string', type: 'string' },
        { alias: 'integer', type: 'integer' },
        { alias: 'ar', type: 'array_string' },
        { alias: 'arms', type: 'array_string', options: { multi_select: true } },
        { alias: 'rtl', type: 'rtl' },
      ]
      
      const sandbox = Sandbox({ record, fields });
      const options = { sandbox }

      let filter = `id = 'js:p.record.getValue("integer")'`;
      let result = await compileFilter(filter, options);
      let expected =  `id = 'js:${record.integer}'`;
      expect(result).toEqual(expected);

      filter = `string = 'js:p.record.getValue("string")'`;
      result = await compileFilter(filter, options);
      expected =  `string = 'js:${record.string}'`;
      expect(result).toEqual(expected);

      filter = `ar = 'js:p.record.getValue("ar")'`;
      result = await compileFilter(filter, options);
      expected =  `ar = 'js:${record.ar}'`;
      expect(result).toEqual(expected);

      filter = `arms = 'js:p.record.getValue("arms")'`;
      result = await compileFilter(filter, options);
      expected =  `arms = 'js:["a","b"]'`;
      expect(result).toEqual(expected);

      filter = `rtl = 'js:p.record.getValue("rtl")'`;
      result = await compileFilter(filter, options);
      expected =  `rtl = 'js:[1,2]'`;
      expect(result).toEqual(expected);

      filter = `rtl IN 'js:p.record.getValue("rtl")'`;
      result = await compileFilter(filter, options);
      expected = `rtl IN 'js:[${record.rtl}]'`;
      expect(result).toEqual(expected);

      filter = `rtl IN 'js:func(p.record.getValue("rtl"))'`;
      result = await compileFilter(filter, options);
      expected = `rtl IN 'js:func([${record.rtl}])'`;
      expect(result).toEqual(expected);
    });

    it('Should null empty arrays', async () => {
      const alias = 'alias';

      const record = {
        [alias]: [],
      };

      const sandbox = Sandbox({ record });
      const options = { sandbox }

      let filter = `id IN 'js:p.record.getValue("alias")'`;
      let result = await compileFilter(filter, options);
      let expected = `id IN 'js:null'`;
      expect(result).toEqual(expected);
    });

    it('Should not preserve strings if the option is false', async () => {
      const record = {
        string: 'string',
      };

      const sandbox = Sandbox({ record });
      const options = { sandbox, preserve_strings: false }
     
      let filter = `id IN 'js:p.record.getValue("string")'`;
      let result = await compileFilter(filter, options);
      let expected = `id IN 'js:${record.string}'`;
      expect(result).toEqual(expected);
    });

    it('Should preserve array function arguments', async () => {
      const record = {
        arms: ['string'],
        rtl: [1]
      };

      const fields = [
        { alias: 'arms', type: 'array_string', options: { multi_select: true } },
        { alias: 'rtl', type: 'rtl' },
      ]
      
      const sandbox = Sandbox({ record, fields });
      const options = { sandbox }

      let filter = `id IN 'js:foo(p.record.getValue("rtl"))' AND id NOT IN 'js:bar(p.record.getValue("arms"))'`;
      let result = await compileFilter(filter, options);
      let expected = `id IN 'js:foo([${record.rtl}])' AND id NOT IN 'js:bar(["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo( p.record.getValue("arms"))' AND id NOT IN 'js:bar( p.record.getValue("rtl"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo( ["${record.arms}"])' AND id NOT IN 'js:bar( [${record.rtl}])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo( p.record.getValue("arms") )' AND id NOT IN 'js:bar( p.record.getValue("rtl") )'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo( ["${record.arms}"] )' AND id NOT IN 'js:bar( [${record.rtl}] )'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo(arg,p.record.getValue("arms"))' AND id NOT IN 'js:bar(arg,p.record.getValue("rtl"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo(arg,["${record.arms}"])' AND id NOT IN 'js:bar(arg,[${record.rtl}])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo(arg, p.record.getValue("arms"))' AND id NOT IN 'js:bar(arg, p.record.getValue("rtl"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo(arg, ["${record.arms}"])' AND id NOT IN 'js:bar(arg, [${record.rtl}])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo(arg, p.record.getValue("arms") )' AND id NOT IN 'js:bar(arg, p.record.getValue("rtl") )'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo(arg, ["${record.arms}"] )' AND id NOT IN 'js:bar(arg, [${record.rtl}] )'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo(arg,p.record.getValue("arms"),arg)' AND id NOT IN 'js:bar(arg,p.record.getValue("rtl"),arg)'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo(arg,["${record.arms}"],arg)' AND id NOT IN 'js:bar(arg,[${record.rtl}],arg)'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo(arg, p.record.getValue("arms"),arg)' AND id NOT IN 'js:bar(arg, p.record.getValue("rtl"),arg)'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo(arg, ["${record.arms}"],arg)' AND id NOT IN 'js:bar(arg, [${record.rtl}],arg)'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo(arg, p.record.getValue("arms") ,arg)' AND id NOT IN 'js:bar(arg, p.record.getValue("rtl") ,arg)'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo(arg, ["${record.arms}"] ,arg)' AND id NOT IN 'js:bar(arg, [${record.rtl}] ,arg)'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo("arg",p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo("arg",["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo('arg',p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo('arg',["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo(\`arg\`,p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo(\`arg\`,["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo([arg],p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo([arg],["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo({},p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo({},["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo((true),p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo((true),["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `id IN 'js:foo((true),p.record.getValue("arms"), p.record.getValue("rtl")) OR (p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `id IN 'js:foo((true),["${record.arms}"], [${record.rtl}]) OR (["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `id IN (p.record.getValue("rtl"))`;
      result = await compileFilter(filter, options);
      expected = `id IN (1)`;
      expect(result).toEqual(expected);
    });

    it('Should preserve multiple sources', async () => {
      const ar = 'ar';
      const arms = 'arms';

      const record = {
        [ar]: 'ar',
        [arms]: ['arms']
      };

      const sandbox = Sandbox({ record });
      const options = { sandbox }

      let filter, result, expected;

      filter = `'js:foo("p.record.getValue("ar")", p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `'js:foo("${record.ar}", ["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `'js:foo("p.record.getValue("ar")", "p.record.getValue("ar")", p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `'js:foo("${record.ar}", "${record.ar}", ["${record.arms}"])'`;
      expect(result).toEqual(expected);

      filter = `'js:foo(p.record.getValue("arms"), "p.record.getValue("ar")")'`;
      result = await compileFilter(filter, options);
      expected = `'js:foo(["${record.arms}"], "${record.ar}")'`;
      expect(result).toEqual(expected);

      filter = `'js:foo(p.record.getValue("arms"), p.record.getValue("arms"), "p.record.getValue("ar")")'`;
      result = await compileFilter(filter, options);
      expected = `'js:foo(["${record.arms}"], ["${record.arms}"], "${record.ar}")'`;
      expect(result).toEqual(expected);

      filter = `'js:foo(p.record.getValue("arms"), "p.record.getValue("ar")", p.record.getValue("arms"))'`;
      result = await compileFilter(filter, options);
      expected = `'js:foo(["${record.arms}"], "${record.ar}", ["${record.arms}"])'`;
      expect(result).toEqual(expected);
    });
  });
});
