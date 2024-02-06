export const isJSValue = (value) => typeof(value) === 'string' && /^js:.*/.test(value);

export const wrapWithGetValue = (string) => `p.record.getValue('${string}')`;

export const wrapWithBrackets = (string) => `(${string})`;
