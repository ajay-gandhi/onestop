
const express = require("express");
const bodyParser = require("body-parser");
const rp = require("request-promise");
const { DialogflowApp } = require("actions-on-google");
const x2js = new (require("x2js"))();
const stringComp = require("damerau-levenshtein");

const Data = require("./data");
const UserDB = require("./postgres");
const users = new UserDB();

const app = express();
app.use(bodyParser.json());
app.set("port", (process.env.PORT || 8000));

// Actions
const welcomeAction = (app) => {
  const userId = app.getUser().userId;
  if (users.getStopId(userId)) {
    respondWithPrediction(app);
  } else {
    app.ask("Welcome to whenstop. To begin setup, please say the name of the transit agency you are interested in.");
  }
};

const selectAgencyAction = (app) => {
  const userId = app.getUser().userId;
  const agencies = Data.fetchAgencies();
  console.log(app.getArgument("agency"), agencies);
  const selected = findClosest(app.getArgument("agency"), agencies.map(a => a.name));
  console.log("selected", selected);
  users.selectAgency(userId, selected.id);
  app.ask("You selected agency " + selected.name + " in " + selected.region + ". Please choose a route.");
};

const selectRouteAction = (app) => {
  const userId = app.getUser().userId;
  const routes = Data.fetchRoutes(users.getAgencyId(userId));
  const selected = findClosest(app.getArgument("route"), routes.map(r => r.name));
  users.selectAgency(userId, selected.id);
  app.ask("You selected route " + selected.name + ". Please choose a direction.");
};

const memDb = {};
const selectDirectionAction = (app) => {
  const userId = app.getUser().userId;
  const directions = Data.fetchDirectionsAndStops(users.getAgencyId(userId)).directions;
  const selected = findClosest(app.getArgument("direction"), directions.map(d => d.name));
  memDb[userId] = selected.id;
  app.ask("You selected direction " + selected.name + ". Please choose a stop.");
};

const selectStopAction = (app) => {
  const userId = app.getUser().userId;
  const ds = Data.fetchDirectionsAndStops(users.getAgencyId(userId));
  const stopsInDirection = ds.directions[memDb[userId]].stops.map(id => ds.stops[id]);
  const selected = findClosest(app.getArgument("stop"), stopsInDirection.map(s => s.name));
  users.selectStop(userId, selected.id);
  users.page(userId);
  app.ask("You selected stop " + selected.name + ". Setup is finished!");
};

// Misc functions
const respondWithPrediction = (app) => {
  const userId = app.getUser().userId;
  Data.getPrediction(users.getAgencyId(userId), users.getRouteId(userId), users.getStopId(userId)).then((minutes) => {
    app.tell("The next vehicle will arrive in " + minutes + " minutes.");
  });
};

const findClosest = (needle, haystack) => {
  let similarity = 0;
  return haystack.reduce((memo, item) => {
    const thisSim = stringComp(item, needle).similarity;
    if (thisSim > similarity) {
      similarity = thisSim;
      return item;
    } else {
      return memo;
    }
  }, false);
};

// Setup actions
const actionMap = new Map();
actionMap.set("welcome", welcomeAction);
actionMap.set("select_agency", selectAgencyAction);
actionMap.set("select_route", selectRouteAction);
actionMap.set("select_direction", selectDirectionAction);
actionMap.set("select_stop", selectStopAction);

app.post("/", (req, res) => {
  const app = new DialogflowApp({ request: req, response: res });
  app.handleRequest(actionMap);
});

app.listen(app.get("port"), () => console.log("Server running"));
