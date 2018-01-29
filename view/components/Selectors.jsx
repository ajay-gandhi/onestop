import "components/scss/Selector.scss";

import React from "react";
import PropTypes from "prop-types";

import Select from "react-select";
import "react-select/dist/react-select.css";
import { connect } from "react-redux";
import { actions } from "components/store/Store";

const Selector = (props) => (
  <div className="Selector">
    <Select
      placeholder={ props.label }
      value={ props.value }
      onChange={ props.onChange }
      disabled={ props.disabled }
      labelKey="name"
      valueKey="id"
      options={ props.options }
    />
  </div>
);
Selector.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.object),
};

export const AgencySelector = connect((state) => {
  return {
    label: "Select an agency...",
    value: state.selectedAgency,
    options: state.agencies.data,
    disabled: state.agencies.isFetching,
  };
}, (dispatch) => {
  return {
    onChange: (e) => {
      dispatch(actions.setValues({ selectedAgency: e.id }));
      dispatch(actions.fetchRoutes());
    },
  };
})(Selector);

export const RouteSelector = connect((state) => {
  return {
    label: "Select a route...",
    value: state.selectedRoute,
    options: state.routes.data,
    disabled: state.routes.isFetching || !state.selectedAgency,
  };
}, (dispatch) => {
  return {
    onChange: (e) => {
      dispatch(actions.setValues({ selectedRoute: e.id }));
      dispatch(actions.fetchDirectionsAndStops());
    },
  };
})(Selector);

export const DirectionSelector = connect((state) => {
  return {
    label: "Select a direction...",
    value: state.selectedDirection,
    options: Object.values(state.directions.data),
    disabled: state.directions.isFetching || !state.selectedRoute,
  };
}, (dispatch) => {
  return {
    onChange: e => dispatch(actions.setValues({ selectedDirection: e.id })),
  };
})(Selector);

export const StopSelector = connect((state) => {
  let options = [];
  if (!state.directions.isFetching && state.selectedDirection) {
    options = state.directions.data[state.selectedDirection].stops.map(s => state.stops.data[s]);
  }

  return {
    label: "Select a stop...",
    value: state.selectedStop,
    options,
    disabled: state.stops.isFetching || !state.selectedDirection,
  };
}, (dispatch) => {
  return {
    onChange: (e) => {
      dispatch(actions.setValues({ selectedStop: e.id }));
      dispatch(actions.getPredictions());
    },
  };
})(Selector);
