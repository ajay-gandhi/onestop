import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Icon from "components/Icon";

class Prediction extends React.PureComponent {
  static propTypes = {
    selectedStop: PropTypes.string,
    predictions: PropTypes.array,
    isFetching: PropTypes.bool,
    generateInstructions: PropTypes.func,
  };

  render = () => {
    if (!this.props.selectedStop) return null;

    let predictionMessage;
    if (this.props.predictions.length > 0) {
      const prediction = this.props.predictions[0].prediction;
      predictionMessage = (
        <div className="Prediction__content">
          <h4 className="Prediction__content__minutes Prediction__verticalCenter">
            <Icon glyph="access_time" className="Prediction__content__icon" />
            Next vehicle arrives in { prediction._minutes } minutes
          </h4>
        </div>
      );
    } else if (!this.props.isFetching) {
      predictionMessage = (
        <div className="Prediction__content Prediction__verticalCenter">
          <Icon glyph="do_not_disturb" className="Prediction__content__icon" />
          No prediction for this stop.
        </div>
      );
    }

    return (
      <div className="Prediction">
        <h3 className="Prediction__title">Sample Prediction</h3>
        { predictionMessage }
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    selectedStop: state.selectedStop,
    predictions: state.predictions.data,
    isFetching: state.predictions.isFetching,
  };
};

export default connect(mapStateToProps)(Prediction);
