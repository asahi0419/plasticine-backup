import styled from 'styled-components';

const getStyles = (className, styles = {}) => {
  return Object.keys(styles[className]).reduce((result, key) => {
    const value = styles[className][key];

    if (value) {
      result = result ? `${result}\n${key}: ${value};` : `${key}: ${value};`;
    }

    return result;
  }, '');
};

export default styled.div`
  position: relative;
  height: 100%;

  .view-map-content {
    position: relative;
    height: 100%;
    min-height: 500px;
    width: 100%;
  }

  .view-map-controls {
    position: absolute;
    top: 0;
    right: initial;
    margin: 6px;

    .view-map-control {
      position: relative !important;
    }
  }

  .mapboxgl-ctrl.mapboxgl-ctrl-scale {
    ${({ styles }) => getStyles('view-map-scale-control', styles)}
  }
`;
