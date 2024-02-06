import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

export default ComposedComponent => class extends Component {
  static propTypes = {
    measureBeforeMount: PropTypes.bool
  }

  static defaultProps = {
    measureBeforeMount: false
  }

  mounted = false

  switchLayoutMode = () => setTimeout(() => this.calculateWidth(), 5)

  onWindowResize = () => this.calculateWidth()

  calculateWidth = () => {
    if (!this.mounted) return
    const node = ReactDOM.findDOMNode(this)

    if (node instanceof HTMLElement) {
      this.setState({ width: node.offsetWidth })
    }
  }

  componentDidMount () {
    this.mounted = true

    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('switchLayoutMode', this.switchLayoutMode)

    this.onWindowResize()
  }

  componentWillUnmount () {
    this.mounted = false

    window.removeEventListener('resize', this.onWindowResize)
    window.removeEventListener('switchLayoutMode', this.switchLayoutMode)
  }

  constructor (props) {
    super(props)

    this.state = { width: 0 };
  }

  render () {
    if (this.props.measureBeforeMount && !this.mounted) {
      return <div className={this.props.className} style={this.props.style} />
    }

    return <ComposedComponent {...this.props} {...this.state} />
  }
}
