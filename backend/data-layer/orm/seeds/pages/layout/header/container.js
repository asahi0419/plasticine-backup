export default {
  name: 'Header container',
  alias: 'header_container',
  component_script: `{
  getHeaderContainerStyle: () => {
    let justifyContent = 'space-between';

    const state= store.getState();
    const hasLHeader = !!lodash.find(state.metadata.app.page, { alias: 'left_header' });
    const hasMHeader = !!lodash.find(state.metadata.app.page, { alias: 'middle_header' });

    if (!hasLHeader && !hasMHeader) justifyContent = 'flex-end';

    return { justifyContent };
  },
}`,
  template: `<div className="header-container" style={page.getHeaderContainerStyle()}>
  {p.getPageElement('left_header', lodash.pick(page.props, ['layoutMode', 'readyComponents']))}
  {p.getPageElement('middle_header', lodash.pick(page.props, ['layoutMode', 'readyComponents']))}
  {p.getPageElement('right_header')}
</div>`,
  styles: `position: fixed;
z-index: 1000;
top: 0;
left: 0;
height: 50px;
width: 100%;

.header-container {
  height: 100%;
  display: flex;
  border-bottom: 1px solid;

  background-color: {headerBackground};
  border-bottom-color: {scrollableListBorder} !important;
  > div {
    border-color: {scrollableListBorder};
  }
  a, i {
    color: {header} !important;
  }
  #expandable .item i {
    color: {mainText} !important;
  }
}`,
  access_script: '!p.currentUser.isGuest()',
  __lock: ['delete'],
};
