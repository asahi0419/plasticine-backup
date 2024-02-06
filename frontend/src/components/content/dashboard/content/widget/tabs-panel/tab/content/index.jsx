import React from 'react';
import styled from 'styled-components';

import View from './types/view';

const WidgetContentStyled = styled.div`
  overflow: auto;

  .widget-content-empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export default class WidgetContent extends React.Component {
  renderContent() {
    const { dashboard, tab = {} } = this.props;
    const { options = {} } = tab;

    if (options.model && options.view) {
      return (
        <div className="widget-content-view">
          <View
            options={options}
            dashboard={dashboard}
          />
        </div>
      );
    }

    return (
      <div className="widget-content-empty">
        {i18n.t('dashboard_view_widget_tab_no_content_configured', { defaultValue: 'No content configured' })}
      </div>
    );
  }

  render() {
    return (
      <WidgetContentStyled className="widget-content">
        {this.renderContent()}
      </WidgetContentStyled>
    );
  }
}
