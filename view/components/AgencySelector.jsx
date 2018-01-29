import "components/scss/AgencySelector.scss";

import React from "react";
import PropTypes from "prop-types";

import Select from "react-select";
import "react-select/dist/react-select.css";
import { connect } from "react-redux";
import { actions } from "components/store/Store";

class AgencySelector extends React.PureComponent {
  static propTypes = {
    selectedAgency: PropTypes.string,
    agencies: PropTypes.arrayOf(PropTypes.object),
    isFetching: PropTypes.bool,
    selectAgency: PropTypes.func,
    fetchStops: PropTypes.func,
  };

  handleAgencyChange = e => {
    this.props.selectAgency(e.id);
    this.props.fetchStops();
  }

  render = () => {
    return (
      <div className="AgencySelector">
        <label className="AgencySelector__label">Select an agency:</label>
        <Select
          name="agency"
          value={ this.props.selectedAgency }
          onChange={ this.handleAgencyChange }
          disabled={ this.props.isFetching }
          labelKey="name"
          valueKey="id"
          options={ this.props.agencies }
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    selectedAgency: state.selectedAgency,
    agencies: state.agencies.data,
    isFetching: state.agencies.isFetching,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    selectAgency: selectedAgency => dispatch(actions.setValues({ selectedAgency })),
    fetchStops: () => dispatch(actions.fetchStops()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AgencySelector);
