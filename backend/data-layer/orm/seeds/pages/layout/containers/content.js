// The page is used as a reference from layout user settings

export default {
  name: 'Content container',
  alias: 'content_container',
  template: `<div className="content-container">
  {page.props.children}
</div>`,
  styles: `position: relative;
min-width: 814px;
background-color: {mainBackground};

.content-container {
  height: 100%;
}

& > div {
  padding: 0 15px !important;
}

@media only screen and (max-width: {UI_TABLET_MAX_SIZE}px) {
  min-width: 768px;
}`,
  access_script: 'true',
  __lock: ['delete'],
};
