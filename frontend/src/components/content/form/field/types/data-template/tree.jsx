import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import ReactTree from 'rc-tree';
import 'rc-tree/assets/index.css';

import { PLACEHOLDER } from './constants';

export default class Tree extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    templates: PropTypes.array.isRequired,
    selected: PropTypes.object.isRequired,
    onDrop: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
  }

  getTemplates() {
    return {
      key: 'item-templates',
      className: 'item-templates',
      children: this.props.templates,
    };
  }

  render() {
    const { items, selected, onSelect, onDrop } = this.props;

    const treeData = [this.getTemplates(), ...items, PLACEHOLDER];
    const selectedKeys = [selected.key];
    const switcherIcon = ({ isLeaf, expanded }) => (!isLeaf && <Icon name={`caret ${expanded ? 'down' : 'right'}`}/>);

    return (
      <div className="tree" style={{ overflowY: 'auto' }}>
        <ReactTree
          draggable
          defaultExpandAll
          showLine
          treeData={treeData}
          onSelect={onSelect}
          onDrop={onDrop}
          selectedKeys={selectedKeys}
          switcherIcon={switcherIcon}
        />
      </div>
    );
  }
}
