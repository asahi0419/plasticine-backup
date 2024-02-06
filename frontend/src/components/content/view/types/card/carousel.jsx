import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from "react-dom";
import styled from 'styled-components';

import { Icon } from 'semantic-ui-react';
import Slider from "react-slick";

import Styles from './styles';
import Item from './item/container';

const DEFAULT_CARD_WIDTH = '25%';

const ItemStyled = styled.div`
  padding-right: ${({ margin }) => parseFloat(margin) / 2}px;
  padding-left: ${({ margin }) => parseFloat(margin) / 2}px;
  outline: none;
`;

export default class Carousel extends Component {
  static propTypes = {
    layout: PropTypes.object.isRequired,
    records: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    actions: PropTypes.array.isRequired,
    handleAction: PropTypes.func.isRequired,
    page: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    onItemClick: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = { slidesToShow: 1, selectedId: null };
    this.slider = null;
    this.cardStyles = Styles.initFromParams(props.layout.card_style);
  }

  getWidth = (elem) => (elem && elem.offsetWidth) || 0;

  getCardWidth = () => {
    let { width = DEFAULT_CARD_WIDTH } = this.cardStyles.getCSSRules(['width']);

    if (`${width}`.includes('%')) {
      const sliderWidth = this.getWidth( ReactDOM.findDOMNode(this.slider) );
      width = sliderWidth * parseFloat(width) / 100;
    }

    return Math.ceil(parseFloat(width));
  }

  componentDidMount = () => {
    const sliderWidth = this.getWidth( ReactDOM.findDOMNode(this.slider) );
    const cardWidth = this.getCardWidth();
    const slidesToShow = Math.round( sliderWidth / cardWidth );
    const imageHeight = Math.round( cardWidth / 1.25 );

    this.setState({ slidesToShow, cardWidth, imageHeight })
  }

  prevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <Icon link name="angle left" size="big" className={className} style={style} onClick={onClick} />
    );
  };

  nextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <Icon link name="angle right" size="big" className={className} style={style} onClick={onClick} />
    );
  };

  onClickItem = (e, recordId) => {
    const { onItemClick } = this.props;

    this.setState({ selectedId: recordId });
    if (onItemClick) onItemClick({ value: recordId });
  }

  render() {
    const { model, actions, fields, records, handleAction, view, layout: { components } } = this.props;
    const { width, margin } = this.cardStyles.getCSSRules(['width', 'margin']);
    const { slidesToShow, cardWidth, imageHeight, selectedId } = this.state;
    const slideWidth = parseFloat(cardWidth || width) + parseFloat(margin);

    var settings = {
      infinite: false,
      speed: 300,
      slidesToShow: slidesToShow,
      slidesToScroll: 1,
      prevArrow: <this.prevArrow />,
      nextArrow: <this.nextArrow />,
      ref: ref => (this.slider = ref),
      lazyLoad: true,
    };

    return (
      <Slider {...settings}>
        {records.map((record, i) =>
          <ItemStyled margin={margin} height={imageHeight} style={{ width: slideWidth }} key={i} onClick={(_, e) => this.onClickItem(e, record.id)}>
            <Item
              model={model}
              fields={fields}
              actions={actions}
              layout={components}
              styles={this.cardStyles}
              record={record}
              handleAction={handleAction}
              view={view}
              imageHeight={imageHeight}
              selected={record.id === selectedId}
            />
          </ItemStyled>
        )}
      </Slider>
    );
  }
}
