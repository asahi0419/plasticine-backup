import React, { Component } from 'react';
import { EDITOR_JS_TOOLS } from './plugins';
import PropTypes from 'prop-types';
import EditorJs, { createReactEditorJS } from 'react-editor-js';
import Image from '@editorjs/image';
import PlasticineApi from '../../../api';
import { uploadFiles, parseOptions, makeUniqueID } from '../../../helpers';
import {getJWTToken, getStaticToken} from "../../../auth";
import { has } from 'lodash/object';

const MIN_HEIGHT = 25;

export default class CustomEditorJs extends Component {
  static propTypes = {
    value: PropTypes.string,
    label: PropTypes.object,
    inline: PropTypes.bool,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
    minHeight: PropTypes.number,
    enableReInitialize : PropTypes.bool,
  };

  static defaultProps = {
    minHeight: 25*15 - 10,
    enableReInitialize : false
  };

  constructor(props) {
    super(props);

    const minHeight = props.minHeight < MIN_HEIGHT ? MIN_HEIGHT : props.minHeight;

    this.state = {
      height: minHeight,
      minHeight: minHeight,
    };

    this.id = `editor-js-${makeUniqueID()}`
  }

  handleChange =  async (api, value) => {
    const { onChange } = this.props;
    if (onChange) onChange(null, {value});
  }

  handleDrag = (e) => {
    const { defaultHeight } = this.state;

    const editor = document.getElementById(this.id);
    const height = e.clientY - editor.getBoundingClientRect().top;

    editor.style.width = '100%';

    this.setState({ height });
  }

  updateToken = (content) => {
    const token = getJWTToken();
    if (!has(content, 'blocks'))
      return [];
    let newContent = {blocks: []};
    let tableData = {isTable: false, html: ''};
    let styleData = {isStyle: false, style: ''};
    for (let block of content.blocks){
      if(block.type === 'image'){
        const {data : { file : { url }}} = block;
        if(url) {
          const imageUrl = url.substr(0, url.indexOf("="));
          const newUrl = imageUrl + '=' + token;
          block.data.file.url = newUrl;
        }
      } else if (block.type === 'header' || block.type === 'paragraph') {
        const {data : { text }} = block;
        if (text) {
          const newText = text.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
          if (tableData.isTable) {
            // in case table started
            if (newText.includes('</table>')) {
              tableData.html += newText.replaceAll(/(\r\n|\n|\r)/gm, "");
              newContent.blocks.push({id: block.id, type: block.type, data: {text: tableData.html}});
              tableData.html = '';
              tableData.isTable = false;
              continue;
            } else {
              tableData.html += newText;
              continue;
            }
          } else {
            // in case not table start
            if (newText.includes('<table') && !newText.includes('</table>')) {
              tableData.isTable = true;
              tableData.html = newText.replaceAll(/(\r\n|\n|\r)/gm, "");
              continue;
            }
          }
          if (styleData.isStyle) {
            // in case style started
            if (newText.includes('</style>')) {
              styleData.style += newText.replaceAll(/(\r\n|\n|\r)/gm, "");
              newContent.blocks.push({id: block.id, type: block.type, data: {text: styleData.style}});
              styleData.style = '';
              styleData.isStyle = false;
              continue;
            } else {
              styleData.style += newText;
              continue;
            }
          } else {
            // in case not style start
            if (newText.includes('<style') && !newText.includes('</style>')) {
              styleData.isStyle = true;
              styleData.style = newText.replaceAll(/(\r\n|\n|\r)/gm, "");
              continue;
            }
          }
          block.data.text = newText;
          newContent.blocks.push(block)
        }
      }
    }
    return newContent;
  }

  escapeToken = (content) => {
    if (!has(content, 'blocks'))
      return [];
    for (let block of content.blocks) {
      if (block.type === 'header' || block.type === 'paragraph') {
        const {data : { text }} = block;
        if (text) {
          const newText = text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          block.data.text = newText;
        }
      }
    }
    return content;
  }


  render() {

    const { label, inline, disabled, value, enableReInitialize, uploadAttachments, record, model } = this.props;
    const { minHeight, height } = this.state;

    const style = {
      display: 'flow-root',
    };

    const editorWrapperStyle = {
      overflow: 'auto',
      display: 'inline-block',
      float: 'right',
      minHeight,
      height,
      width: inline ? 'calc(100% - 130px)' : '100%',
      opacity: disabled ? '0.6' : 1,
      borderRadius: '5px',
      padding: '0 6px 0 3px',
    };

    const dragBarStyle = {
      position: 'relative',
      top: '-3px',
      width: '100%',
      height: '6px',
      cursor: 'row-resize',
      opacity: 0,
    }

    const className = `${inline ? 'inline ' : ''}field editor-js`;

    const options = {
      useWorker: false,
      tabSize: 2,
    };

    let data = { blocks: [], ...parseOptions(value) };

    const imageTool = {
      class: Image,
      config: {
        additionalRequestHeaders : {
          Authorization : `${getJWTToken('JWT')}`,
        },
        uploader: {
          uploadByFile : async (file) => {
            let callBackResult;

            function callBack() {
              callBackResult = true;
            }

            if (file) uploadFiles([ {file:file} ], callBack());

            if(callBackResult){
              file['fileName'] = file.name;
              let data = await uploadAttachments(model, record, [file]);
              if(data && data.length > 0){
                const {id, attributes : {file_name} } = data[0];
                return {
                  success: 1,
                  file: {
                    url: PlasticineApi.getAttachmentURL({id, file_name}),
                  }
                };
              }
            }

          },

          uploadByUrl(url) {
            return {
              success: 0,
              file: {
                url: '',
            }
          }
          }
        }
      }
    };

    const tools = EDITOR_JS_TOOLS(imageTool);
    return (
      <div id={this.id} className={className} style={style}>
        {label}
        <div className="editor-js-wrapper" style={editorWrapperStyle} ref="editorWrapper">
          <EditorJs
            tools={tools}
            readOnly={disabled}
            autofocus={true}
            onChange={this.handleChange}
            data={disabled ? this.updateToken(data): this.escapeToken(data)}
            enableReInitialize={enableReInitialize}
          />
          <div draggable="true" style={dragBarStyle} onDrag={this.handleDrag}></div>
        </div>
      </div>
    );
  }
}
