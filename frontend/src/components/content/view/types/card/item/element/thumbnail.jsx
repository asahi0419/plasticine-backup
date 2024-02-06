import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react'

import Loader from '../../../../../../shared/loader';
import ImageRenderer from '../../../../../../shared/renderers/attachment/image';
import * as HELPERS from '../../../../../../../helpers';

export default class ThumbnailElement extends Component {
  static propTypes = {
    model: PropTypes.object,
    record: PropTypes.object.isRequired,
    fromSelf: PropTypes.bool,
    fromField: PropTypes.object,
    align: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    imageHeight: PropTypes.number,
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.setState(this.stateFromProps(this.props));
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.stateFromProps(nextProps));
  }

  onLoad = () => {
    this.setState({ loaded: true, error: false });
  }

  onError = (e) => {
    this.setState({ loaded: true, error: true });
  }

  stateFromProps = (props) => {
    const { model, fromField, record, fromSelf } = props;
    const { relationships } = record.metadata;
    const { thumbnail: stateThumbnail = {} } = this.state;

    let thumbnail;
    let url;

    if (fromSelf) {
      thumbnail = record.attributes;
      url = `/${model.alias}/form/${record.id}`;
    } else if (fromField && relationships) {
      const relatedRecord = relationships[fromField.alias];
      const relatedModelAlias = HELPERS.parseOptions(fromField.options).foreign_model;
      thumbnail = relatedRecord ? relatedRecord.__metadata.thumbnail : null;
      url = `/${relatedModelAlias}/form/${relatedRecord.id}`;
    } else {
      thumbnail = record.metadata.thumbnail || {};
      url = `/${model.alias}/form/${record.id}`;
    }

    return {
      thumbnail,
      url,
      loaded: stateThumbnail.id === thumbnail.id,
      error: !thumbnail,
      type: HELPERS.getFileType(thumbnail),
    };
  }

  renderImg = () => {
    const { thumbnail, loaded, error } = this.state;

    return (
      <div>
        {!loaded && <Loader compact size="small" pattern={false} />}
        {!error ? <ImageRenderer
          attachment={thumbnail}
          onLoad={this.onLoad}
          onError={this.onError}
          imageHeight={this.props.imageHeight}
        /> : this.renderIcon('image')}
      </div>
    );
  }

  renderIcon = (type) => {
    return (
      <div style={{ height: this.props.imageHeight, textAlign: 'center' }}>
        <Icon
          name={HELPERS.getFileIcon(type)}
          disabled size="massive"
        />
      </div>
    );
  }

  renderImage() {
    const { params, align } = this.props;
    const { thumbnail, url } = this.state;

    if (!thumbnail) return null;

    const marginsByTextAlign = {
      left: '0 auto 0 0',
      center: '0 auto',
      right: '0 0 0 auto',
    };

    const margin = marginsByTextAlign[align];
    const linkStyle = { display: 'block', width: '100%', margin };
    if (params.max_width) linkStyle.maxWidth = params.max_width + 'px';
    if (params.max_height) linkStyle.maxHeight = params.max_height + 'px';

    if (params.suppress_click) {
      return this.renderImg(thumbnail);
    } else {
      return (
        <Link to={url} style={linkStyle}>
          {this.renderImg(thumbnail)}
        </Link>
      );
    }
  }

  render() {
    const { type } = this.state;

    return (type === 'image') ? this.renderImage() : this.renderIcon(type);
  }
}
