import { map, filter, orderBy, groupBy, reduce } from 'lodash/collection';

export const getVisibleSections = (data = {}, term) => {
  const FC = filterBy('p-legend', 'features', data.features);
  const GC = filterBy('p-legend', 'groups',   data.groups);
  const SC = filterBy('p-legend', 'sections', data.sections);

  const FS = filterBy('search', 'features', FC, { term });
  const GS = filterBy('search', 'groups',   GC, { term });

  const FG = groupBy(FS, (f = {}) => f.properties.section);
  const GG = groupBy(GS, 'section');

  return reduce(SC, (result, section) => {
    if (GG[section.id]) {
      const groups = map(GG[section.id] || [], (group = {}) => {
        if (typeof group.cnt === 'object') {
          if (group.cnt.hasOwnProperty('show')) {
            if (!group.cnt.show) return group;
          }
        }

        const items = filter(FC, ({ properties: p = {} }) => {
          if (p.section !== section.id) return;
          if (p.group !== group.id) return;

          if (typeof group.cnt === 'object') {
            if (group.cnt.hasOwnProperty('by')) {
              return p?.attr.hasOwnProperty(group.cnt.by);
            }
          }

          return true;
        });

        group.size = items.length;

        return group;
      });
      section.groups = filter(groups, (g) => {
        if (section.id === 'Associated objects') return g.size;
        return true;
      })
      section.groups = orderBy(section.groups, ['name'], [section.order]);
      result.push(section);
      return result;
    }
    if (FG[section.id]) {
      section.features = orderBy(FG[section.id], ['name'], [section.order]);
      result.push(section);
      return result;
    }

    return result;
  }, []);
}


function filterBy(prop, type, items = [], params = {}) {
  if (prop === 'p-legend') {
    return filter(items, (i = {}) => {
      if (['sections', 'groups'].includes(type)) return i['p-legend'] || i['plg'];
      if (['features'].includes(type)) return i.properties['p-legend'] || i.properties['plg'];
    });
  }

  if (prop === 'search' && params.term) {
    return filter(items, (i = {}) => {
      let name;

      if (type === 'groups') name = i['p-name'] || i['pn'] || i.id || '';
      if (type === 'features') name = i.properties['p-name'] || i.properties['pn'] || i.id || '';

      try {
        return name.match(new RegExp(params.term, 'gi'));
      } catch (error) {
        console.log(error);
        return false;
      }
    });
  }

  return items
}
