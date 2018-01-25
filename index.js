
const express = require("express");
const bodyParser = require("body-parser");
const rp = require("request-promise");
const DialogflowApp = require("actions-on-google").DialogflowApp;
const x2js = new (require("x2js"))();

const UserDB = require("./postgres");
const users = new UserDB();

const app = express();
app.use(bodyParser.json());
app.set("port", (process.env.PORT || 8000));

// Setup actions
const actionMap = new Map();
actionMap.set("welcome", welcomeAction);

app.post("/", (req, res) => {
  const app = new DialogflowApp({ request: req, response: res });
  app.handleRequest(actionMap);
});

// Actions
const welcomeAction = (app) => {
  const userId = app.getUser().userId;
  if (users.getStopId(userId)) {
    respondWithPrediction(app);
  } else {
    app.tell("Welcome to whenstop. Please say the name of the transit agency you are interested in.");
  }
};
const agencyAction = (app) => {
  const userId = app.getUser().userId;
};

// Misc functions
const respondWithPrediction = (app) => {
  const userId = app.getUser().userId;
  const params = {
    command: "predictions",
    a: users.getAgencyId(userId),
    stopId: users.getStopId(stopId),
  };
  if (users.getRouteId(userId)) params.r = users.getRouteId(userId);

  rp(generateApiUrl(params)).then((res) => {
    const data = x2js.xml2js(res);
    console.log("raw data: ", data);
    const prediction = data.body.predictions.direction.prediction[0];
    console.log("first prediction: ", prediction);
    app.tell("The next vehicle will arrive in " + prediction._minutes + " minutes.");
  });
};

const generateApiUrl = (params) => {
  const BASE = "http://webservices.nextbus.com/service/publicXMLFeed?";
  return BASE + Object.keys(params).map(key => key + "=" + params[key]).join("&");
};

app.listen(app.get("port"), () => console.log("Server running"));
