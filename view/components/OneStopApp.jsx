import "components/scss/OneStopApp.scss";

import React from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { Provider } from "react-redux";
import { actions, store } from "components/store/Store";

import {
  AgencySelector,
  RouteSelector,
  DirectionSelector,
  StopSelector,
} from "components/Selectors";
import Prediction from "components/Prediction";
import Instructions from "components/Instructions";

class OneStopApp extends React.Component {
  static propTypes = {
    fetchAgencies: PropTypes.func,
  };

  componentDidMount = () => {
    this.props.fetchAgencies();
  }

  render = () => {
    return (
      <div className="OneStopApp">
        <h1 className="OneStopApp__heading">OneStop</h1>
        <p className="OneStopApp__description">
          Use this tool to find what information to give to the OneStop app
          when setting it up on Google Assistant.
        </p>
        <AgencySelector />
        <RouteSelector />
        <DirectionSelector />
        <StopSelector />
        <Prediction />
        <Instructions />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAgencies: () => dispatch(actions.fetchAgencies()),
  };
};
const ConnectedOneStopApp = connect(null, mapDispatchToProps)(OneStopApp);

const OneStopAppContainer = () => <Provider store={ store }><ConnectedOneStopApp /></Provider>;
export default OneStopAppContainer;
