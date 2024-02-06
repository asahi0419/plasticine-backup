import { map, groupBy, includes } from 'lodash-es';

const STATIC_ASSOCIATIONS = ['attachments'];

export function processIncludes(option, rtlFields) {
  let parsedInclude;

  switch (typeof (option)) {
    case 'string':
      parsedInclude = option.split(',').map(processIncludeAssociation);
      break;
    case 'object':
      parsedInclude = [option];
      break;
    default:
      parsedInclude = [];
  }

  const associationsByType = groupBy(parsedInclude, 'type');

  const rtlFieldAliases = map(rtlFields, 'alias');
  const splittedAssociations = groupBy(associationsByType.has_one, ({ alias }) => (includes(map(rtlFieldAliases, alias)) ? 'habtm' : 'has_one'));

  if (splittedAssociations.habtm) {
    associationsByType.has_one = splittedAssociations.has_one;
    associationsByType.habtm = map(splittedAssociations.habtm, (a) => {
      a.type = 'habtm';
      return a;
    });
  }

  if (splittedAssociations.has_one) {
    associationsByType.has_one = splittedAssociations.has_one;
  } else {
    delete associationsByType.has_one;
  }

  return associationsByType;
}

function processIncludeAssociation(item) {
  const includeChain = item.split('.').reverse();
  let association = {};

  while (includeChain.length) {
    if (association.alias) {
      association = { child: association };
    }

    association.alias = includeChain[0];

    if (STATIC_ASSOCIATIONS.includes(association.alias)) {
      association.type = 'static';
    } else if (association.alias[0] === '<') {
      association.type = 'has_many';
      association.alias = association.alias.substr((association.alias.length - 1) * -1);
    } else {
      association.type = 'has_one';
    }

    includeChain.shift();
  }

  return association;
}
