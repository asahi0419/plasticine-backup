import React from 'react';
import { Segment, Dimmer, Loader } from 'semantic-ui-react';

export default (props = {}) => {
  const { style, simple, compact, dimmer, image, size = 'large', pattern = true, content } = props;

  const height = compact ? 190 : 250;
  const patternStyle = { height, width: '100%', backgroundSize: '30px 30px' };

  if (simple) {
    return (
      <div>
        Loading ...
      </div>
    );
  }

  if (image) {
    const style = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <div style={style}>
        <img src={image} />
        {content}
      </div>
    );
  }

  if (dimmer) {
    return (
      <Dimmer active inverted style={style} className="loader-component dimmed">
        <Loader size={size} />
      </Dimmer>
    );
  }

  return (
    <Segment vertical style={style}>
      <Dimmer active inverted>
        <Loader size={size} />
      </Dimmer>

      {pattern && <div style={patternStyle} className="loader-pattern" />}
    </Segment>
  );
};
