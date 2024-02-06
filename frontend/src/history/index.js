import qs from 'qs';
import { browserHistory } from 'react-router';
import { findLastIndex, last } from 'lodash/array';
import { find, filter } from 'lodash/collection';
import { isEqual } from 'lodash/lang';
import { pick } from 'lodash/object';

import store from '../store';
import Entry from './entry';
import * as HELPERS from './helpers';
import { makeUniqueID } from '../helpers';
import { LOCATION_CHANGED } from '../actions/types';

class History {
  constructor(provider) {
    if (!provider) return;

    this.provider = provider;
    this.entries = [];
    this.errors = [];
    this.listener = provider.listen(this.onChange.bind(this));
  }

  onChange(location) {
    store.redux.instance.dispatch({ type: LOCATION_CHANGED });
    HELPERS.prepareGoBackEntries(this);

    const entry = new Entry(location);

    this.isExist(entry)
      ? this.prev(entry)
      : this.next(entry);
  }

  goBack(options = {}) {
    const { push = true } = options;

    const queryOptions = qs.parse(window.location.search.replace(/^\?/, ''));
    if (queryOptions.back_url) return window.location.assign(queryOptions.back_url);

    HELPERS.prepareGoBackEntries(this, options);

    const prevEntry = this.getPrevEntry();
    const currEntry = this.getCurrEntry();

    if (currEntry.isForm()) {
      const nearestView = this.findNearest('view', this.entries);
      const nearestNest = this.findNesting('view', this.entries);
      const nearestForm = find(nearestNest, (entry) => !isEqual(entry.model, currEntry.model));

      if (nearestForm) {
        return push ? this.push({ ...nearestForm, hash: `#${makeUniqueID()}` }) : nearestForm.url;
      }

      if (nearestView) {
        return push ? this.push(nearestView) : nearestView.url;
      }
    }

    if (prevEntry) {
      return push ? this.push(prevEntry) : prevEntry.url;
    }
  }

  push(path, state) {
    return this.provider.push(path, state);
  }

  next(entry) {
    this.entries.push(entry);
    console.log('->', entry);
  }

  prev(entry) {
    this.entries = this.entries.slice(0, entry.index).concat(entry);
    console.log('<-', entry);
  }

  getPrevEntry() {
    return this.entries[this.entries.length - 2];
  }

  getCurrEntry() {
    return last(this.entries);
  }

  findNearest(contentType, entries) {
    const entriesFiltered = filter(entries, (entry) => {
      if (contentType === 'form') return entry.isForm();
      if (contentType === 'view') return entry.isView();
    });

    return find(entriesFiltered.reverse(), (entry) => {
      const path = `.*${entry.model}/${contentType}\/.*`;
      const regexp = new RegExp(path, 'i');

      return regexp.test(entry.pathname);
    });
  }

  findNesting(contentType, entries) {
    const nearest = this.findNearest(contentType, entries);
    return entries.slice(entries.indexOf(nearest) + 1).reverse();
  }

  findEntry(path) {
    return find(this.entries, (entry) => {
      const regexp = new RegExp(path, 'i');
      return regexp.test(entry.pathname);
    });
  }

  createEntry(path, search) {
    const entry = new Entry({ pathname: path, search });
    this.entries.push(entry);
  }

  deleteEntry(path) {
    this.entries = filter(this.entries, (entry) => {
      const regexp = new RegExp(path, 'i');
      return !regexp.test(entry.pathname);
    });
  }

  addError(params = {}, error = {}) {
    const path = `.*${params.modelAlias}/.*/${params.viewAlias}`;
    const entry = this.findEntry(path);

    if (entry) {
      this.errors.push({
        url: entry.url,
        status: (error.response || {}).status,
      });
    }
  }

  isExist(entry) {
    entry.index = findLastIndex(this.entries, { url: entry.url });
    return entry.index >= 0;
  }

  isValid(entry) {
    return !find(this.errors, { url: entry.url });
  }

  isLeft(type, params) {
    const entry = this.getCurrEntry();

    switch (type) {
      case 'form':
        return !entry.isForm() || (entry.model !== params.modelAlias) || (entry.id !== params.recordId);
      case 'view':
        return !entry.isView() || (entry.model !== params.modelAlias) || (entry.alias !== params.viewAlias);
      case 'page':
        return !entry.isPage() || (entry.alias !== params.pageAlias);
      default:
        return false;
    }
  }
}

export default new History(browserHistory);
