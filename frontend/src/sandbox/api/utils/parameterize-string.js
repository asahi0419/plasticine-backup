
export default (value, { blackList = [], length = 55, isURL = false } = {}) => {
  let newValue = (/[А-Я-Ё]/gi.test(value) ? translit(value) : value)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 _]/g, ' ') // convert unwanted chars to spaces
    .replace(/\s\s+/g, ' ');         // convert multi spaces to single space

  newValue =  isURL ?
    newValue.replace(/\s/g, '-')     // convert spaces to hyphens
    .replace(/__+/g, '-')  :         // convert multi hyphens to single hyphen
    newValue.replace(/\s/g, '_')     // convert spaces to underscores
            .replace(/__+/g, '_');   // convert multi underscores to single underscores

  if (newValue.length > length) newValue = newValue.slice(0, length);
  if (blackList.includes(newValue)) newValue = addCounter(newValue, blackList);
  if (newValue.endsWith('_')) newValue = newValue.slice(0, newValue.length - 1)

  return newValue;
}

const translit = (str) => {
  const c = {
    'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'jo', 'ж':'zh', 'з':'z', 'и':'i', 'й':'j', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'h', 'ц':'c', 'ч':'ch', 'ш':'sh', 'щ':'shch', 'ъ':'', 'ы':'y', 'ь':'', 'э':'e', 'ю':'ju', 'я':'ja'
  };
  str = str.toLowerCase();
  let newStr = String();
  for (let i = 0; i < str.length; i++) {
    const ch = str.charAt(i);
    newStr += ch in c ? c[ch] : ch;
  }
  return newStr;
};

const addCounter = (value, blackList, i = 1) => {
  let newValue = `${value}_${i}`;
  return blackList.includes(newValue) ? addCounter(value, blackList, i + 1) : newValue;
};
