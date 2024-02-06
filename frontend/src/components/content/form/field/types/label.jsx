import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Popup } from 'semantic-ui-react';
import { some } from 'lodash/collection';
import { assign } from 'lodash/object';

import { getSetting, makeUniqueID } from '../../../../../helpers';

export default class Label extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    hint: PropTypes.string,
    inline: PropTypes.bool,
    content: PropTypes.string,
    required: PropTypes.bool,
    contextMenuRenderer: PropTypes.func,
  }

  static defaultProps = {
    contextMenuRenderer: (content) => (content),
  }

  constructor(props) {
    super(props);

    this.state = {
      hintIsOpened: false,
      hintIcon: getSetting('decoration.form.field.hint.icon'),
    };
  }

  componentWillMount = () => {
    document.addEventListener('click', this.handleCloseHint);
  }

  componentWillUnmount = () => {
    document.removeEventListener('click', this.handleCloseHint);
  }

  handleOpenHint = (e) => {
    e.preventDefault();
    document.querySelectorAll(':focus').forEach(el => el.blur());

    if (!this.props.hint) return;

    this.setState({ hintIsOpened: true });
  }

  handleCloseHint = (e) => {
    if (!this.props.hint) return;

    const { target = {} } = e;
    const { classList = [] } = target;
    const { classList: parentClassList = [] } = target.parentNode || {};

    if (target.id == this.props.id) return;
    if (this.state.hintIsOpened === false) return;
    if (some([ ...classList, ...parentClassList ], (className) => className == this.props.id)) return;

    this.setState({ hintIsOpened: false });
  }

  handleMouseOut = () => {
    if (!this.props.hint) return;

    clearTimeout(this.showHintTimeout);
    this.setState({ hintIsOpened: false });
  }

  handleMouseOver = () => {
    if (!this.props.hint) return;

    this.showHintTimeout = setTimeout(() => this.setState({ hintIsOpened: true }), 500);
  }

  renderRequiredIcon() {
    if (!this.props.required) return;
    return <Icon name="asterisk" />;
  }

  renderContentHint() {
    const { hint, content, tutorial } = this.props;
    const { hintIsOpened, hintIcon } = this.state;
    if (!hint || hintIcon) return content;
    const trigger = <span>{content}</span>;

    if (tutorial) {
      return (
        <Popup
          trigger={trigger}
          content={this.getContentWithTutor(tutorial, hint)}
          flowing hoverable
        />
      );
    }

    if (hint) {
      return (
        <Popup
          open={hintIsOpened}
          trigger={trigger}
          content={hint}
        />
      );
    }

    return content;
  }

  getContentWithTutor(tutorial, hint) {
    if (lodash.isString(hint) && hint.startsWith('static.')) {
      hint = i18n.t(hint.replace('static.', ''))
    }

    if (!tutorial) {
      return hint;
    }

    if (!hint) {
      return (
        <a target="_blank" style={{ textDecoration: 'underline' }} href={tutorial}>
          {i18n.t('open_tutorial_in_new_tab', { defaultValue: 'Open tutorial in the new tab' })}
        </a>
      )
    }

    return (
      <span>
        <span>
          {hint}. &nbsp;
        </span>
        <a target="_blank" style={{ textDecoration: 'underline' }} href={tutorial}>
          {i18n.t('see_more_in_new_tab', { defaultValue: 'See more in the new tab' })}
        </a>
      </span>
    );
  }

  renderIconHint() {
    const { hint, id, tutorial } = this.props;
    const { hintIsOpened, hintIcon } = this.state;

    if (!((hint || tutorial) && hintIcon)) return;

    const className = `${id} hint-icon`;

    const style = {
      position: 'absolute',
      top: '-2px',
      right: '-11px',
      margin: 0,
      fontSize: '8px',
      cursor: 'pointer',
    };

    const popupStyle = {
      marginLeft: '-16px',
      marginBottom: '6px',
    };

    const trigger = (
      <Icon
        name={hintIcon}
        style={style}
        onClick={this.handleOpenHint}
        className={className}
      />
    );

    return (
      <Popup
        open={hintIsOpened}
        trigger={trigger}
        content={this.getContentWithTutor(tutorial, hint)}
        style={popupStyle}
        className={className}
      />
    );
  }

  renderContent() {
    const { style, contextMenuRenderer } = this.props;

    return contextMenuRenderer(
      <span style={{ position: 'relative', ...style }}>
        {this.renderRequiredIcon()}
        {this.renderContentHint()}
        {this.renderIconHint()}
      </span>
    );
  }

  render() {
    const { id, inline } = this.props;
    const { hintIcon } = this.state;

    const props = {
      htmlFor: id,
      style: {
        marginRight: 15,
        paddingLeft: inline ? 5 : 0,
        overflowWrap: 'break-word',
        fontSize: '1em',
        fontWeight: 'normal',
      },
    };

    if (!inline) {
      assign(props.style, {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      });
    }

    if (!hintIcon) {
      assign(props, {
        onMouseOver: this.handleMouseOver,
        onMouseOut: this.handleMouseOut
      });
    }

    return (
      <label {...props}>
        {this.renderContent()}
      </label>
    );
  }
}
