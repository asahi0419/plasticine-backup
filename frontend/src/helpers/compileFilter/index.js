import lodash from 'lodash'

export default (filter, options = {}) => {
  if (!filter) return;

  lodash.each((filter.match(/\b\IN \(([^()]*|\([^()]*\))*\)/g) || []), (func) => {
    const patterns = lodash.uniq(func.match(/p\.record\.getValue\(\".*?\"\)/g) || []);
    patterns.filter((p) => {
      const value = options.sandbox.executeScript(p, { modelId: options.model ? options.model.id : null }, 'filter')
      if (lodash.isArray(value)) filter = filter.replace(func, `IN (${value})`);
    })
  });

  lodash.each((filter.match(/\b\w+\(([^()]*|\([^()]*\))*\)/g) || []), (func) => {
    const patterns = lodash.uniq(func.match(/p\.record\.getValue\(\".*?\"\)/g) || []);
    const arrayPatterns = patterns.filter((p) => {
      const value = options.sandbox.executeScript(p, { modelId: options.model ? options.model.id : null}, 'filter')
      return lodash.isArray(value)
    }) 

    lodash.each(arrayPatterns, (pattern) => {
      const newFunc = func.replace(new RegExp(pattern, 'g'), '[$&]');
      filter = filter.replace(func, newFunc);
      func = newFunc;
    });
  });

  const pRecordExpressions = filter.match(/p\.record\.getValue\(\".*?\"\)/g) || [];
  
  lodash.each(pRecordExpressions, (expression) => {
    const context = { modelId: options.model ? options.model.id : null}
    const value = options.sandbox.executeScript(expression, context, 'filter')
    let replace = escapeValue(value, options);

    filter = filter.replace(`${expression}`, ((replace === 0) ? 0 : (replace || null)));
  })

  return filter;
};

const escapeValue = (value, options = {}) => {
  if (lodash.isArray(value)) {
    if (!value.length) return null
    const result = lodash.map(value, v => {
      return lodash.isString(v) ? `"${v}"` : `${v}`
    })
    return `[${result}]`
  }

  if (options.preserve_strings) {
    if (lodash.isString(value) && value) {
      value = `"${value}"`;
    }
  }

  return value
}