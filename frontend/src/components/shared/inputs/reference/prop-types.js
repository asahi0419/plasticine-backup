import PropTypes from 'prop-types';

export default {
  config: PropTypes.shape({
    foreignModel: PropTypes.string,
    label: PropTypes.string,
    view: PropTypes.string,
    form: PropTypes.string,
    filter: PropTypes.string,
  }),
  name: PropTypes.any,
  value: PropTypes.any,
  options: PropTypes.array,
  inline: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onOpenReferenceCreator: PropTypes.func,
};
