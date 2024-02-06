import BasicComponentTester from './helpers/basic-component-tester';

global.AmCharts = {};
global.matchMedia = global.matchMedia || (() => ({ matches: false, addListener: () => {}, removeListener: () => {} }));
global.i18n = { t: () => null };
global.BasicComponentTester = BasicComponentTester;

if (typeof window === 'object') {
  window.URL.createObjectURL = window.URL.createObjectURL || (() => null);
}
