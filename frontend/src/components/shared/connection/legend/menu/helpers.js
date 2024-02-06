import { map, filter, orderBy, groupBy, reduce } from 'lodash/collection';
import ArrayStringField from '../../../../content/form/field/types/array-string';

export const getVisibleSections = (data = {}, term) => {
  const FC = filterBy('p-legend', 'graph', data.graph);
  const GC = filterBy('p-legend', 'groups',   data.groups);
  const SC = filterBy('p-legend', 'sections', data.sections);

  const FS = filterBy('search', 'graph', FC, { term });
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
      section.graph = orderBy(FG[section.id], ['name'], [section.order]);
      result.push(section);
      return result;
    }
    
    return result;
  }, []);
}


function filterBy(prop, type, items = [], params = {}) {
  // if (prop === 'p-legend') {
  //   return filter(items, (i = {}) => {
  //     if (['sections', 'groups'].includes(type)) return i['p-legend'] || i['plg'];
  //     if (['graph'].includes(type)) return i.properties['p-legend'] || i.properties['plg'];
  //   });
  // }

  if (prop === 'search' && params.term) {
    return filter(items, (i = {}) => {
      let name;

      if (type === 'groups') name = i['p-name'] || i['pn'] || i.id || '';
      if (type === 'graph') name = i.properties['p-name'] || i.properties['pn'] || i.id || '';

      try {
        return name.match(new RegExp(params.term, 'gi'));
      } catch (error) {
        return false;
      }
    });
  }

  return items
}


export const handleSort = (sections = [], sort ) => {
  let not_sort = [], tem_mid = [], exam = [], new_section = []; 
  let count = 0; 
  sections.map(ea => {
    ea.type == 'root' ? not_sort.push(ea.id) : ''; 
  }); 
  not_sort.map((x, index) => {
    sections.map(each => {
      each.parent == x ? tem_mid.push(each) : ''
    }); 
    exam = tem_mid.sort((a, b) => {
      var aa = a.name[0]; 
      var bb = b.name[0]; 
     
      if (aa === aa.toUpperCase() && bb === bb.toUpperCase()) {
        return a.name.localeCompare(b.name); 
      }
      if (a.name.toUpperCase().startsWith('Z') && !b.name.toUpperCase().startsWith('Z')) {
        return 1;
      }
      if (!a.name.toUpperCase().startsWith('Z') && b.name.toUpperCase().startsWith('Z')) {
        return -1;
      }
      return b.name.localeCompare(a.name); 
      
    })
    sections.map((each, index1) => {
      each.parent == x ? (sections[index1] = exam[count], count++) : ''; 
    }); 
    count = 0; 
    tem_mid = []; 
  }); 
  not_sort = []; 
  exam = []; 

  if (sort.length !== 0) {
    sort.map((x, index) => {
      sections.map(each => {
        each.parent == x ? tem_mid.push(each) : ''
      }); 
      if (tem_mid.length > 1) {
        exam = tem_mid.sort((a, b) => {
          if (a.name.toUpperCase().startsWith('A') && !b.name.toUpperCase().startsWith('A')) {
            return 1;
          }
          if (!a.name.toUpperCase().startsWith('A') && b.name.toUpperCase().startsWith('A')) {
            return -1;
          }
          return b.name.localeCompare(a.name); 
        })
        sections.map((each, index1) => {
          each.parent == x ? (sections[index1] = exam[count], count++) : ''
        }); 
      }
              
      count = 0; 
      tem_mid = []; 
    });   
  }
  sections.map(each_root => {
    each_root.type == 'root' && new_section.includes(each_root) == false ? (
      new_section.push(each_root), 
      sections.map(eac_mid => {
        eac_mid.parent == each_root.id && new_section.includes(eac_mid) == false ? (
          new_section.push(eac_mid), 
          sections.map(each_end => {
            each_end.parent == eac_mid.id && new_section.includes(each_end) == false ? (
              new_section.push(each_end)
            ) : ''
          })
        ) : ''
      })
    ) : ''
  }); 
  return new_section;
}