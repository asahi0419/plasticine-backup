const fs = require("fs");

const pkInfo = JSON.parse(fs.readFileSync(`${__dirname}/package.json`, 'utf8'));

module.exports.pkInfo = pkInfo
module.exports._PARSER_SIG = `${pkInfo.name}@${pkInfo.version} [${pkInfo.homepage}]`;