
const rp = require("request-promise");
const x2js = new (require("x2js"))();

const generateApiUrl = (params) => {
  const BASE = "http://webservices.nextbus.com/service/publicXMLFeed?";
  return BASE + Object.keys(params).map(key => key + "=" + params[key]).join("&");
};

module.exports.fetchAgencies = () => {
  const params = {
    command: "agencyList",
  };

  return rp(generateApiUrl(params)).then((res) => {
    const data = x2js.xml2js(res);
    return data.body.agency.map((agency) => ({
      id: agency._tag,
      name: agency._title,
      region: agency._regionTitle,
    }));
  });
};

module.exports.fetchRoutes = (agencyId) => {
  const params = {
    command: "routeList",
    a: agencyId,
  };

  return rp(generateApiUrl(params)).then((res) => {
    const data = x2js.xml2js(res);
    return data.body.route.map((route) => ({
      id: route._tag,
      name: route._title,
    }));
  });
};

module.exports.fetchDirectionsAndStops = (agencyId, routeId) => {
  const params = {
    command: "routeConfig",
    a: agencyId,
    r: routeId,
  };

  return rp(generateApiUrl(params)).then((res) => {
    const data = x2js.xml2js(res);

    console.log(data.body);
    const directions = data.body.route.direction.map((direction) => ({
      id: direction._tag,
      name: direction._title,
      stops: direction.stop.map(stop => stop._tag),
    }));

    const stops = data.body.route.stop.map((stop) => ({
      id: stop._tag,
      name: stop._title,
    }));

    return {
      directions: directions,
      stops: stops,
    };
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
