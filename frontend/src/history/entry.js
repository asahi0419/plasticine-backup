export default class Entry {
  constructor(location) {
    const { pathname = '', search = '', hash = '' } = location;

    this.pathname = pathname;
    this.search = search;
    this.model = (pathname.match(/\/?(\w+)\//) || []).slice(1)[0];
    this.hash = hash;
    this.url = pathname + search;

    if (this.isForm()) this.id = (pathname.split('/')[3] === 'new') ? pathname.split('/')[4] : pathname.split('/')[3];
    if (this.isView()) this.alias = pathname.split('/')[4];
    if (this.isPage()) this.alias = pathname.split('/')[2];
  }

  isForm() {
    return /.*\/form\/.*/.test(this.pathname);
  }

  isView() {
    return /.*\/view\/.*/.test(this.pathname);
  }

  isPage() {
    return /.*\/pages\/.*/.test(this.pathname) || /.*\/privileges/.test(this.pathname);
  }
}
