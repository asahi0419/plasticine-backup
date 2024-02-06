import React from 'react';
import styled from 'styled-components';

import * as CONFIGS from '../configs';

const LegendWidthResizerStyled = styled.div`
  display: ${props => props.visible ? `block` : 'none'};
  position: absolute;
  top: 0;
  right: -5px;
  display: block;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  opacity: 0;
`;

const LegendWidthResizer = ({ configs, onChange }) => {
  let legendWidth = configs.legendWidth;
  let contentWidth = configs.contentWidth;
  let legendMaxWidth = configs.legendMaxWidth || CONFIGS.DEFAULT_LEGEND_MAX_WIDTH

  const onDrag = (e) => {
    const legend = document.getElementById('view-calendar-legend-menu');
    const content = document.querySelector('.view-calendar-content');
    const controls = document.querySelector('.view-calendar-controls');

    const lw = e.clientX - legend.getBoundingClientRect().left;
    const cw = content.parentElement.offsetWidth - lw;
    if (lw > legendMaxWidth) return;
    if (lw < CONFIGS.DEFAULT_LEGEND_MIN_WIDTH) return;

    legend.style.width = `${lw}px`;
    controls.style.left = `${lw}px`;
    content.style.width = `${cw}px`;
    content.style.left = `${lw}px`;

    legendWidth = lw;
    contentWidth = cw;

    // map.resize();
  };

  const onDragEnd = (e) => {
    onChange('configs', {
      legendWidth,
      contentWidth,
    });
  };

  return (
    <LegendWidthResizerStyled
      className="view-calendar-legend-width-resizer"
      draggable="true"
      visible={configs.legendShow}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
    />
  );
};

export default LegendWidthResizer;
