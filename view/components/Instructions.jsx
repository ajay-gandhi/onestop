import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const Instructions = (props) => {
  if (!props.selectedStop.name) return null;
  return (
    <div className="Instructions">
      <p>
        If this prediction seems accurate, use the following information to set
        up OneStop on your Google Assistant:
      </p>
      <ul>
        <li><b>Agency:</b> { props.selectedAgency.name }</li>
        <li><b>Route:</b> { props.selectedRoute.name }</li>
        <li><b>Direction:</b> { props.selectedDirection.name }</li>
        <li><b>Stop:</b> { props.selectedStop.name }</li>
      </ul>
    </div>
  );
};
Instructions.propTypes = {
  selectedAgency: PropTypes.object,
  selectedRoute: PropTypes.object,
  selectedDirection: PropTypes.object,
  selectedStop: PropTypes.object,
};

const mapStateToProps = (state) => {
  const selectedAgency = state.agencies.data.reduce((memo, a) => a.id === state.selectedAgency ? a : memo, false);
  const selectedRoute = state.routes.data.reduce((memo, r) => r.id === state.selectedRoute ? r : memo, false);

  return {
    selectedAgency: selectedAgency || {},
    selectedRoute: selectedRoute || {},
    selectedDirection: state.directions.data[state.selectedDirection] || {},
    selectedStop: state.stops.data[state.selectedStop] || {},
  };
};

export default connect(mapStateToProps)(Instructions);
