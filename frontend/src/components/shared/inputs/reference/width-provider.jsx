import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { omit } from 'lodash/object';

export default ComposedComponent => class extends Component {
  static propTypes = {
    measureBeforeMount: PropTypes.bool
  }

  static defaultProps = {
    measureBeforeMount: false
  }

  mounted = false

  onWindowResize = () => this.calculateWidth()

  calculateWidth = () => {
    if (!this.mounted) return

    this.node = ReactDOM.findDOMNode(this)
    this.nodeText = this.node.querySelector('.text')

    if (this.node instanceof HTMLElement) {
      this.setState({ width: this.node.offsetWidth, title: this.props.title })
    }
  }

  componentDidMount () {
    this.mounted = true
    window.addEventListener('resize', this.onWindowResize)
    this.calculateWidth()
  }

  componentWillUnmount () {
    this.mounted = false
    window.removeEventListener('resize', this.onWindowResize)
  }

  componentDidUpdate () {
    if (this.props.title !== this.state.title) {
      this.calculateWidth()
    }
  }

  constructor (props) {
    super(props)

    this.state = { width: 0 };
  }

  getProps() {
    const propsToOmit = ['measureBeforeMount'];

    const showTitle = this.nodeText && (this.nodeText.offsetWidth < this.nodeText.scrollWidth);
    if (!showTitle) propsToOmit.push('title');

    return omit(this.props, propsToOmit);
  }

  render () {
    if (this.props.measureBeforeMount && !this.mounted) {
      return <div className={this.props.className} style={this.props.style} />
    }

    return <ComposedComponent {...this.getProps()} />
  }
}
