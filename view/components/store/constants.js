export const ACTION_TYPES = Object.freeze({
  setValues: "SET_VALUES",
  requestData: "REQUEST_DATA",
  doneRequestingData: "DONE_REQUESTING_DATA",
  setData: "SET_DATA",
});

export const INITIAL_STATE = Object.freeze({
  agencies: {
    isFetching: false,
    data: [],
  },
  routes: {
    isFetching: false,
    data: [],
  },
  directions: {
    isFetching: false,
    data: {},
  },
  stops: {
    isFetching: false,
    data: {},
  },
  predictions: {
    isFetching: false,
    data: [],
  },
});
