import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Watermark from 'react-awesome-watermark';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';

import { getSetting } from '../../helpers';

export default class WatermarkWrapper extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    dimensions: PropTypes.object.isRequired,
  }

  componentDidMount() {
    const watermark = getSetting('decoration.watermark') || {};
    const { signature = {} } = watermark;
    const { enable = true, text, text_color = '#E6E6E6', font_size = 1.75 } = signature;

    if (!enable) return;

    const { width, height } = this.props.dimensions;

    const watermarkText = text || getSetting('project_name');
    const themeFontSize = 14;
    const fontSize = themeFontSize * font_size;
    const space = fontSize * 5;
    const h_space = themeFontSize * 2;

    // frontend rendering
    const html = document.createElement('div');
    const root = createRoot(html);

    root.render(
      <Watermark
        text={watermarkText}
        style={{
          fontSize: fontSize,
          space: space,
          h_space: h_space,
          color: text_color,
          width: width,
          height: height,
          opacity: 0.5,
          rotate: -45
        }}
        multiple
      >
        {this.props.children}
      </Watermark>
    );

    const iframe=document.createElement('iframe');
    document.body.appendChild(iframe);
    const wrapper = document.querySelector('.watermark-wrapper');

    setTimeout(() => {
      const iframedoc = iframe.contentDocument || iframe.contentWindow.document;
      iframedoc.body.innerHTML = html.innerHTML;
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;

      html2canvas(iframedoc.body).then(canvas => {
        wrapper.appendChild(canvas);
        document.body.removeChild(iframe);
      });
    }, 10);
  }

  render() {
    const watermark = getSetting('decoration.watermark') || {};
    const { signature = {} } = watermark;
    const { enable = true } = signature;

    if (!enable) {
      return (
        <div>
          {this.props.children}
        </div>
      );
    }

    return (
      <div className='watermark-wrapper'>
      </div>
    );
  }
}
