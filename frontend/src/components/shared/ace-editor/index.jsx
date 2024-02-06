import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/theme-ambiance";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-python";

const MIN_HEIGHT = 32;

const MODES = {
  js: 'javascript',
  python: 'python',
  jsx: 'jsx',
  json: 'json',
  css: 'css',
};

export default class extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    label: PropTypes.object,
    inline: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    syntax: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    minHeight: PropTypes.number,
    error: PropTypes.bool,
  }

  static defaultProps = {
    minHeight: 150,
  }

  constructor(props) {
    super(props);

    const minHeight = props.minHeight < MIN_HEIGHT ? MIN_HEIGHT : props.minHeight;

    this.state = {
      height: minHeight,
      minHeight: minHeight,
    };
  }

  handleChange = (value) => {
    const { onChange } = this.props;

    if (onChange) onChange(null, { value });
  }

  handleBlur = (value) => {
    const { onBlur } = this.props;

    if (onBlur) onBlur(e, { value });
  }

  handleDrag = (e) => {
    const editor = document.getElementById(this.props.id);
    const height = e.clientY - editor.getBoundingClientRect().top;

    editor.style.width = '100%';

    this.setState({ height });
  }

  render() {
    const { id, label, inline, disabled, theme, value, syntax, error } = this.props;
    const { minHeight, height } = this.state;

    const style = {
      display: 'flow-root',
    };

    const editorWrapperStyle = {
      display: 'inline-block',
      float: 'right',
      minHeight,
      height,
      width: inline ? 'calc(100% - 130px)' : '100%',
      opacity: disabled ? '0.6' : 1,
    };

    const editorStyle = {
      minHeight,
      height,
      zIndex: 0,
      backgroundColor: error ? '#fff6f6' : '#FFFFFF',
      boxShadow: error ? '0px 0px 0 1px #e0b4b4' : '0px 0px 0 1px #d9d9d9'
    }

    const dragBarStyle = {
      position: 'relative',
      top: '-3px',
      width: '100%',
      height: '6px',
      cursor: 'row-resize',
      opacity: 0,
    }

    const className = `${inline ? 'inline ' : ''}field`;

    const options = {
      useWorker: false,
      tabSize: 2,
    };

    return (
      <div className={className} style={style}>
        {label}
        <div style={editorWrapperStyle} ref="editorWrapper">
          <AceEditor
            name={id}
            mode={MODES[syntax]}
            width={'100%'}
            theme={theme}
            value={value || ''}
            onChange={this.handleChange}
            showPrintMargin={false}
            useSoftTabs={false}
            wrapEnabled={true}
            height={`${height}`}
            setOptions={options}
            readOnly={disabled}
            style={editorStyle}
          />
          <div draggable="true" style={dragBarStyle} onDrag={this.handleDrag}></div>
        </div>
      </div>
    );
  }
}
