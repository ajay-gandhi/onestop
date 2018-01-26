
const rp = require("request-promise");
const x2js = new (require("x2js"))();

const generateApiUrl = (params) => {
  const BASE = "http://webservices.nextbus.com/service/publicXMLFeed?";
  return BASE + Object.keys(params).map(key => key + "=" + params[key]).join("&");
};

const memoized = {
  routes: {},
  ds: {},
};

module.exports.fetchAgencies = () => {
  if (memoized.agencies) return memoized.agencies;

  const params = {
    command: "agencyList",
  };

  return rp(generateApiUrl(params)).then((res) => {
    const data = x2js.xml2js(res);
    const agencies = data.body.agency.map((agency) => ({
      id: agency._tag,
      name: agency._title,
      region: agency._regionTitle,
    }));
    memoized.agencies = agencies;
    return agencies;
  });
};

module.exports.fetchRoutes = (agencyId) => {
  if (memoized.routes[agencyId]) return memoized.routes[agencyId];

  const params = {
    command: "routeList",
    a: agencyId,
  };

  return rp(generateApiUrl(params)).then((res) => {
    const data = x2js.xml2js(res);
    const routes = data.body.route.map((route) => ({
      id: route._tag,
      name: route._title,
    }));
    memoized.routes[agencyId] = routes;
    return routes;
  });
};

module.exports.fetchDirectionsAndStops = (agencyId, routeId) => {
  if (memoized.ds[agencyId] && memoized.ds[agencyId][routeId]) return memoized.ds[agencyId][routeId];

  const params = {
    command: "routeConfig",
    a: agencyId,
    r: routeId,
  };

  return rp(generateApiUrl(params)).then((res) => {
    const data = x2js.xml2js(res);

    const directions = data.body.route.direction.map((direction) => ({
      id: direction._tag,
      name: direction._title,
      stops: direction.stop.map(stop => stop._tag),
    }));

    const stops = data.body.route.stop.map((stop) => ({
      id: stop._tag,
      name: stop._title,
    }));

    const ds = {
      directions: directions,
      stops: stops,
    };

    if (!memoized.ds[agencyId]) memoized.ds[agencyId] = {};
    memoized.ds[agencyId][routeId] = ds;
    return ds;
  });
};

module.exports.getPrediction = (agencyId, routeId, stopId) => {
  const params = {
    command: "predictions",
    a: agencyId,
    r: routeId,
    s: stopId,
  };

  return rp(generateApiUrl(params)).then((res) => {
    const data = x2js.xml2js(res);
    const prediction = data.body.predictions.direction.prediction[0];
    return prediction._minutes;
  });
};
