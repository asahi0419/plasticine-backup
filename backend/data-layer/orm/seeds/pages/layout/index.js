export default {
  name: 'Layout',
  alias: 'layout',
  template: `<div className="layout">
  <Background active={page.state.activeBackground} />
  {p.getPageElement('header_container', { layoutMode: page.state.layoutMode, readyComponents: page.props.readyComponents })}
  {p.getPageElement('sidebar_container', { styles: page.getStyles().sidebar })}
  {p.getPageElement('content_container', { styles: page.getStyles().content, children: page.props.children })}
</div>`,
  styles: `.layout {
  height: 100%;
}`,
  component_script: `{
  initState: () => {
    return {
      activeBackground: false,
      layoutMode: page.getLayoutMode(),
    };
  },

  componentWillMount: () => {
    page.backgroundStatusToken = PubSub.subscribe('background.status', (_, status) => {
      page.setState({
        activeBackground: status !== 'finished'
      });
    });

    page.switchLayoutModeToken = PubSub.subscribe('switch_layout_mode', (_, layoutMode) => {
      page.setState({ layoutMode });
      !helpers.isTablet() && page.updateUserSetting({ layout_mode: layoutMode });
    });

    window.addEventListener('resize', page.onWindowResize)
  },

  componentWillUnmount: () => {
    PubSub.unsubscribe(page.backgroundStatusToken);
    PubSub.unsubscribe(page.switchLayoutModeToken);

    window.removeEventListener('resize', page.onWindowResize)
  },

  onWindowResize() {
    page.setState({ layoutMode: page.getLayoutMode() });
  },

  getLayoutMode() {
    const state = store.getState();

    const hasHeader = !!lodash.find(state.metadata.app.page, { alias: 'header_container' });
    const hasSidebar = !!lodash.find(state.metadata.app.page, { alias: 'sidebar_container' });
    const isTablet = helpers.isTablet();

    let layoutMode = p.getSetting('layout_mode');

    if (layoutMode === 'show_sidebar') {
      if (hasHeader && !hasSidebar) layoutMode = 'show_content_only';
      if (!hasHeader && !hasSidebar) layoutMode = 'show_content_without_sidebar_without_header';
      if (!hasHeader && hasSidebar) layoutMode = 'show_content_with_sidebar_without_header';
      if (hasHeader && isTablet) layoutMode = 'show_content_only';
      if (!hasHeader && isTablet) layoutMode = 'show_content_without_sidebar_without_header';
    } else if (layoutMode === 'show_content_only') {
      if (!hasHeader && !hasSidebar) layoutMode = 'show_content_without_sidebar_without_header';
      if (!hasHeader && hasSidebar) layoutMode = 'show_content_with_sidebar_without_header';
    } else {
      if (hasHeader && hasSidebar) layoutMode = 'show_sidebar';
      if (hasHeader && !hasSidebar) layoutMode = 'show_content_only';
      if (!hasHeader && !hasSidebar) layoutMode = 'show_content_without_sidebar_without_header';
      if (!hasHeader && hasSidebar) layoutMode = 'show_content_with_sidebar_without_header';
      if (hasHeader && isTablet) layoutMode = 'show_content_only';
      if (!hasHeader && isTablet) layoutMode = 'show_content_without_sidebar_without_header';
    }

    return layoutMode;
  },

  getStyles() {
    const styles = {
      show_sidebars: {
        sidebar: {
          top: '50px',
          height: 'calc(100% - 50px)',
          width: '420px',
        },
        content: {
          top: '50px',
          left: '420px',
          height: 'calc(100% - 50px)',
          width: 'calc(100% - 420px)',
        }
      },
      show_sidebar: {
        sidebar: {
          top: '50px',
          height: 'calc(100% - 50px)',
          width: '210px',
        },
        content: {
          top: '50px',
          left: '210px',
          height: 'calc(100% - 50px)',
          width: 'calc(100% - 210px)',
        }
      },
      show_content_only: {
        sidebar: {
          top: '50px',
          height: 'calc(100% - 50px)',
          width: 0,
        },
        content: {
          top: '50px',
          height: 'calc(100% - 50px)',
          width: '100%',
        }
      },
      show_content_without_sidebar_without_header: {
        sidebar: {
          top: '50px',
          height: 'calc(100% - 50px)',
          width: 0,
        },
        content: {
          width: '100%',
        }
      },
      show_content_with_sidebar_without_header: {
        sidebar: {
          height: '100%',
          width: '210px',
        },
        content: {
          left: '210px',
          width: 'calc(100% - 210px)',
        }
      },
    };

    const style = styles[page.state.layoutMode];

    if (helpers.isTablet()) {
      const sidebar = document.querySelector('.sidebar-container');

      style.content.left = 0;
      style.content.width = '100%';
      style.sidebar.zIndex = 10;

      if (style.sidebar.width) {
        style.content.filter = 'brightness(60%)';
        style.content.pointerEvents = 'none';
        style.sidebar.width = '75%';

        bodyScrollLock.disableBodyScroll(sidebar);
      } else {
        bodyScrollLock.enableBodyScroll(sidebar);
      }
    }

    return style;
  }
}`,
  access_script: 'true',
  __lock: ['delete'],
};
