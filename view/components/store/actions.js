import fetch from "cross-fetch";
import { ACTION_TYPES } from "./constants";

import X2JS from "x2js";

const x2js = new X2JS();

/** Sync actions **/
const setValues = (values) => {
  return {
    type: ACTION_TYPES.setValues,
    values,
  };
};

/** Sync actions for use by async actions **/
const requestData = (model) => {
  return {
    type: ACTION_TYPES.requestData,
    model,
  };
};
const doneRequestingData = (model) => {
  return {
    type: ACTION_TYPES.doneRequestingData,
    model,
  };
};
const setData = (model) => {
  return {
    type: ACTION_TYPES.setData,
    model,
  };
};

/** Async actions **/
const apiBase = "http://webservices.nextbus.com/service/publicXMLFeed?command=";
const fetchAgencies = () => {
  return (dispatch) => {
    dispatch(requestData("agencies"));
    return fetch(`${apiBase}agencyList`).then(
      response => response.text(),
      error => console.log("Error fetching agencies", error)
    ).then((xml) => {
      const data = x2js.xml2js(xml);
      const agencies = data.body.agency.map((agency) => {
        return {
          id: agency._tag,
          name: agency._title,
          region: agency._regionTitle,
        };
      });
      dispatch(setData({ agencies }));
      dispatch(doneRequestingData("agencies"));
    });
  };
};

const fetchRoutes = () => {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(requestData("routes"));
    return fetch(`${apiBase}routeList&a=${state.selectedAgency}`).then(
      response => response.text(),
      error => console.log("Error fetching routes", error)
    ).then((xml) => {
      const data = x2js.xml2js(xml);
      const routes = data.body.route.map((route) => {
        return {
          id: route._tag,
          name: route._title,
        };
      });
      dispatch(setData({ routes }));
      dispatch(doneRequestingData("routes"));
    });
  };
};

const fetchDirectionsAndStops = () => {
  return (dispatch, getState) => {
    dispatch(requestData("directions"));
    dispatch(requestData("stops"));
    const state = getState();
    return fetch(`${apiBase}routeConfig&a=${state.selectedAgency}&r=${state.selectedRoute}`).then(
      response => response.text(),
      error => console.log("Error fetching directions and stops", error)
    ).then((xml) => {
      const data = x2js.xml2js(xml);

      const directions = data.body.route.direction.reduce((memo, direction) => {
        memo[direction._tag] = {
          id: direction._tag,
          name: direction._title,
          stops: direction.stop.map(stop => stop._tag),
        };
        return memo;
      }, {});

      const stops = data.body.route.stop.reduce((memo, stop) => {
        memo[stop._tag] = {
          id: stop._tag,
          stopId: stop._stopId,
          name: stop._title,
        };
        return memo;
      }, {});

      dispatch(setData({ directions }));
      dispatch(setData({ stops }));
      dispatch(doneRequestingData("directions"));
      dispatch(doneRequestingData("stops"));
    });
  };
};

const getPredictions = () => {
  return (dispatch, getState) => {
    dispatch(requestData("predictions"));
    const state = getState();
    const stopId = state.stops.data[state.selectedStop].stopId;
    const routeParam = state.selectedRoute ? `&r=${state.selectedRoute}` : "";
    return fetch(`${apiBase}predictions&a=${state.selectedAgency}${routeParam}&stopId=${stopId}`).then(
      response => response.text(),
      error => console.log("Error fetching prediction list", error)
    ).then((xml) => {
      const data = x2js.xml2js(xml);
      const predictions = data.body.predictions.direction;
      dispatch(setData({ predictions }));
      dispatch(doneRequestingData("predictions"));
    });
  };
};

const actions = {
  // Sync,
  setValues,

  // Async
  fetchAgencies,
  fetchRoutes,
  fetchDirectionsAndStops,
  getPredictions,
};
export default actions;
