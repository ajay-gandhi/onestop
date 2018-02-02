/* global require, process, __dirname */

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const { DialogflowApp } = require("actions-on-google");
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
    app.ask("Welcome to OneStop. To begin setup, please say the name of the transit agency you are interested in.");
  }
};

const selectAgencyAction = (app) => {
  const userId = app.getUser().userId;
  Data.fetchAgencies().then((agencies) => {
    const selected = findClosest(app.getArgument("agency"), agencies);
    if (selected) {
      users.selectAgency(userId, selected.id);
      app.setContext("selected-agency");
      app.ask("You selected agency " + selected.name + " in region " + selected.region + ". Please choose a route.");
    } else {
      app.ask("I'm sorry, I didn't recognize that agency. Please repeat the name of the agency.");
    }
  });
};

const selectRouteAction = (app) => {
  const userId = app.getUser().userId;
  Data.fetchRoutes(users.getAgencyId(userId)).then((routes) => {
    const selected = findClosest(app.getArgument("route"), routes);
    if (selected) {
      users.selectRoute(userId, selected.id);
      app.setContext("selected-route");
      app.ask("You selected route " + selected.name + ". Please choose a direction.");
    } else {
      app.ask("I'm sorry, I didn't recognize that route. Please repeat the name of the route.");
    }
  });
};

const memDb = {};
const selectDirectionAction = (app) => {
  const userId = app.getUser().userId;
  Data.fetchDirectionsAndStops(users.getAgencyId(userId), users.getRouteId(userId))
    .then(({ directions }) => {
      const selected = findClosest(app.getArgument("direction"), directions);
      if (selected) {
        memDb[userId] = selected;
        app.setContext("selected-direction");
        app.ask("You selected direction " + selected.name + ". Please choose a stop.");
      } else {
        app.ask("I'm sorry, I didn't recognize that direction. Please repeat the name of the direction.");
      }
    });
};

const selectStopAction = (app) => {
  const userId = app.getUser().userId;
  Data.fetchDirectionsAndStops(users.getAgencyId(userId), users.getRouteId(userId))
    .then(({ stops }) => {
      const stopsInDirection = memDb[userId].stops.map(id => stops[id]);
      const selected = findClosest(app.getArgument("stop"), stopsInDirection);
      if (selected) {
        users.selectStop(userId, selected.id);
        users.page(userId);
        app.setContext("selected-stop");
        app.tell("You selected stop " + selected.name + ". Setup is finished!");
      } else {
        app.ask("I'm sorry, I didn't recognize that stop. Please repeat the name of the stop.");
      }
    });
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
  const idx = haystack.reduce((memo, item, i) => {
    const thisSim = stringComp(item.name, needle).similarity;
    if (thisSim > similarity) {
      similarity = thisSim;
      return i;
    } else {
      return memo;
    }
  }, false);
  return haystack[idx];
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

// Serve view
app.use(express.static("public"));
app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "public/index.html")));

app.listen(app.get("port"), () => console.log("Server running"));
