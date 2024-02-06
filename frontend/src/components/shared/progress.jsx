import React from 'react';
import PropTypes from 'prop-types';
import * as Semantic from 'semantic-ui-react';

export default class Progress extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { progress: { percent: 100 } };
  }

  componentDidMount = () => {
    PubSub.subscribe(this.props.id, (_, progress) => this.setState({ progress }));
  }

  render() {
    const style = {
      display: this.state.progress.percent === 100 ? 'none' : 'block',
      position: 'absolute',
      width: '100%',
      margin: 0
    };

    return (
      <Semantic.Progress
        style={style}
        percent={this.state.progress.percent}
        label={this.state.progress.message}
        size="tiny"
        indicating
        active
      />
    );
  }
}
