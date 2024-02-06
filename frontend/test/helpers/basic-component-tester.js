import React from 'react';
import { mount } from 'enzyme';
import { each } from 'lodash/collection';
import { isEmpty, isObject, isFunction, isString, isArray } from 'lodash/lang';
import { keys } from 'lodash/object';
import { Provider } from 'react-redux';

import store from '../../src/store';

export default class BasicComponentTester {
  constructor(cases = [], props = {}, methods = {}) {
    this.cases = cases;
    this.props = { required: {}, ...props };
    this.methods = methods;
  }

  propsResult = ({ wrap }, result) => {
    each(result, (prop, key) => {
      let propDisplay = prop || '';
      if (isObject(prop)) propDisplay = JSON.stringify(prop);
      if (isFunction(prop)) propDisplay = 'jest.fn()';
      propDisplay = propDisplay.length > 30 ? `${propDisplay.slice(0, 30)}...` : propDisplay;

      it(`Should receive '${key}': '${propDisplay}'`, () => {
        expect(wrap.prop(key)).toEqual(prop);
      });
    });
  }

  renderResult = ({ wrap }, result) => {
    each(result, element => {
      it(`Should render '${element}'`, () => {
        expect(!!wrap.find(element).length).toEqual(true);
      });
    });
  }

  clicksResult = ({ wrap, props }, result) => {
    each(result, (method, element) => {
      it(`Should call '${method}' when '${element}' is clicked`, () => {
        wrap.find(element).simulate('click');
        expect(props[method]).toHaveBeenCalled();
      });
    });
  }

  valueResult = ({ wrap }, result) => {
    each(result, (value, element) => {
      let valueDisplay = value || '';
      if (isString(value)) valueDisplay = `'${value}'`;
      if (isArray(value)) valueDisplay = `[${value}]`;

      it(`Should set without error value ${valueDisplay} into '${element}'`, () => {
        const input = wrap.find(element);

        expect(input.props().value).toEqual(value);
        expect(input.find('.error').length).toEqual(0);
      });
    });
  }

  stateResult = ({ wrap, props }, result) => {
    each(result, (value, key) => {
      it(`Should have correct '${key}'`, () => {
        expect(wrap.instance().state[key]).toEqual(value);
      });
    });
  }

  methodsResult = ({ wrap, props }, result) => {
    each(result, (value, key) => {
      it(`Should correctly run method '${key}'`, () => {
        expect(wrap.instance()[key](value.input)).toEqual(value.output);
      });
    });
  }

  spyOnMethods = () => {
    each(this.methods, (method, key) => {
      spyOn(this.methods, key);
    });
  }

  mountComponent = (component) => {
    each(this.cases, (c) => {
      const children = { ...component, props: c.props };
      const options = { context: c.context, childContextTypes: c.childContextTypes };

      c.wrap = mount(<Provider children={children} store={store} />, options).children();
    });
  }

  spreadRequiredProps = () => {
    each(this.cases, (c) => {
      c.props = { ...this.props.required, ...c.props };
      c.result.props = { ...this.props.required, ...c.props };
    });
  }

  result = () => {
    each(this.cases, (c, i) => {
      describe(`Case ${i + 1}:`, () => {
        each(keys(c.result).reverse(), (type) => {
          describe(type, () => this[`${type}Result`](c, c.result[type]));
        });
      });
    });
  }

  test = (component) => {
    beforeAll(() => {
      this.spyOnMethods();
    });

    this.spreadRequiredProps();
    this.mountComponent(component);
    this.result();
  }
}
