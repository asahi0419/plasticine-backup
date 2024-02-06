import { map } from 'lodash-es';

import * as HELPERS from '../helpers.js';

describe('Filter', () => {
  describe('Helpers', () => {
    describe('compileFilter(filter, record)', () => {
      it('Should return compiled filter by source record', async () => {
        const record = {
          string: 'string',
          integer: 1,
          array_string: 'a',
          array_string_multiple: ['a', 'b'],
          reference_to_list: [1, 2],
        };

        const getRecordValue = (alias) => record[alias];

        let filter = `id IN ({string}) AND id NOT IN ({integer})`;
        let result = await HELPERS.compileFilter(filter, record);
        let expected = `id IN ("${record.string}") AND id NOT IN (${record.integer})`;
        expect(result).toEqual(expected);

        filter = `id IN ( {string}) AND id NOT IN ( {integer})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN ( "${record.string}") AND id NOT IN ( ${record.integer})`;
        expect(result).toEqual(expected);

        filter = `id IN ({string} ) AND id NOT IN ({integer} )`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN ("${record.string}" ) AND id NOT IN (${record.integer} )`;
        expect(result).toEqual(expected);

        filter = `id IN ( {string} ) AND id NOT IN ( {integer} )`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN ( "${record.string}" ) AND id NOT IN ( ${record.integer} )`;
        expect(result).toEqual(expected);

        filter = `id IN js:func({array_string})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN js:func("${record.array_string}")`;
        expect(result).toEqual(expected);

        filter = `id IN js:func({array_string_multiple})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN js:func([${map(record.array_string_multiple, (v) => `"${v}"`)}])`;
        expect(result).toEqual(expected);

        filter = `id IN js:func({reference_to_list})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN js:func([${record.reference_to_list}])`;
        expect(result).toEqual(expected);
      });

      it('Should null empty arrays', async () => {
        const alias = 'alias';

        const record = {
          [alias]: [],
        };

        let filter = `id IN ({${alias}})`;
        let result = await HELPERS.compileFilter(filter, record);
        let expected = `id IN (null)`;
        expect(result).toEqual(expected);
      });

      it('Should preserve array function arguments', async () => {
        const alias1 = 'alias1';
        const alias2 = 'alias2';

        const record = {
          [alias1]: ['string'],
          [alias2]: [1]
        };

        let filter = `id IN foo({${alias1}}) AND id NOT IN bar({${alias2}})`;
        let result = await HELPERS.compileFilter(filter, record);
        let expected = `id IN foo(["${record[alias1]}"]) AND id NOT IN bar([${record[alias2]}])`;
        expect(result).toEqual(expected);

        filter = `id IN foo( {${alias1}}) AND id NOT IN bar( {${alias2}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo( ["${record[alias1]}"]) AND id NOT IN bar( [${record[alias2]}])`;
        expect(result).toEqual(expected);

        filter = `id IN foo( {${alias1}} ) AND id NOT IN bar( {${alias2}} )`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo( ["${record[alias1]}"] ) AND id NOT IN bar( [${record[alias2]}] )`;
        expect(result).toEqual(expected);

        filter = `id IN foo(arg,{${alias1}}) AND id NOT IN bar(arg,{${alias2}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo(arg,["${record[alias1]}"]) AND id NOT IN bar(arg,[${record[alias2]}])`;
        expect(result).toEqual(expected);

        filter = `id IN foo(arg, {${alias1}}) AND id NOT IN bar(arg, {${alias2}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo(arg, ["${record[alias1]}"]) AND id NOT IN bar(arg, [${record[alias2]}])`;
        expect(result).toEqual(expected);

        filter = `id IN foo(arg, {${alias1}} ) AND id NOT IN bar(arg, {${alias2}} )`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo(arg, ["${record[alias1]}"] ) AND id NOT IN bar(arg, [${record[alias2]}] )`;
        expect(result).toEqual(expected);

        filter = `id IN foo(arg,{${alias1}},arg) AND id NOT IN bar(arg,{${alias2}},arg)`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo(arg,["${record[alias1]}"],arg) AND id NOT IN bar(arg,[${record[alias2]}],arg)`;
        expect(result).toEqual(expected);

        filter = `id IN foo(arg, {${alias1}},arg) AND id NOT IN bar(arg, {${alias2}},arg)`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo(arg, ["${record[alias1]}"],arg) AND id NOT IN bar(arg, [${record[alias2]}],arg)`;
        expect(result).toEqual(expected);

        filter = `id IN foo(arg, {${alias1}} ,arg) AND id NOT IN bar(arg, {${alias2}} ,arg)`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo(arg, ["${record[alias1]}"] ,arg) AND id NOT IN bar(arg, [${record[alias2]}] ,arg)`;
        expect(result).toEqual(expected);

        filter = `id IN foo("arg",{${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo("arg",["${record[alias1]}"])`;
        expect(result).toEqual(expected);

        filter = `id IN foo('arg',{${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo('arg',["${record[alias1]}"])`;
        expect(result).toEqual(expected);

        filter = `id IN foo(\`arg\`,{${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo(\`arg\`,["${record[alias1]}"])`;
        expect(result).toEqual(expected);

        filter = `id IN foo([arg],{${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo([arg],["${record[alias1]}"])`;
        expect(result).toEqual(expected);

        filter = `id IN foo({},{${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo({},["${record[alias1]}"])`;
        expect(result).toEqual(expected);

        filter = `id IN foo((true),{${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo((true),["${record[alias1]}"])`;
        expect(result).toEqual(expected);

        filter = `id IN foo((true),{${alias1}}, {${alias2}}) OR ({${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `id IN foo((true),["${record[alias1]}"], [${record[alias2]}]) OR ("${record[alias1]}")`;
        expect(result).toEqual(expected);
      });

      it('Should preserve multiple sources', async () => {
        const alias1 = 'alias1';
        const alias2 = 'alias2';

        const record = {
          [alias1]: 'alias1',
          [alias2]: ['alias2']
        };

        let filter, result, expected;

        filter = `foo({${alias1}}, {${alias2}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `foo("${record[alias1]}", ["${record[alias2]}"])`;
        expect(result).toEqual(expected);

        filter = `foo({${alias1}}, {${alias1}}, {${alias2}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `foo("${record[alias1]}", "${record[alias1]}", ["${record[alias2]}"])`;
        expect(result).toEqual(expected);

        filter = `foo({${alias2}}, {${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `foo(["${record[alias2]}"], "${record[alias1]}")`;
        expect(result).toEqual(expected);

        filter = `foo({${alias2}}, {${alias2}}, {${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `foo(["${record[alias2]}"], ["${record[alias2]}"], "${record[alias1]}")`;
        expect(result).toEqual(expected);

        filter = `foo({${alias2}}, {${alias1}}, {${alias2}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `foo(["${record[alias2]}"], "${record[alias1]}", ["${record[alias2]}"])`;
        expect(result).toEqual(expected);

        filter = `foo({${alias1}}, {${alias2}}, {${alias1}})`;
        result = await HELPERS.compileFilter(filter, record);
        expected = `foo("${record[alias1]}", ["${record[alias2]}"], "${record[alias1]}")`;
        expect(result).toEqual(expected);
      });
    });
  });
});
