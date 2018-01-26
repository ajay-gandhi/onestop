/* global require, process, module */
/**
 * User database module backed by PostGreSQL. Supports get/set operations.
 */

"use strict";

const { Client } = require("pg");

module.exports = (function () {

  function PostGres () {
    this.users = {};
    const self = this;

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });

    client.connect();
    this.client = client;

    client.query(
      "CREATE TABLE IF NOT EXISTS users (" +
      "id SERIAL PRIMARY KEY, " +
      "googleId varchar(100) NOT NULL, " +
      "agencyId varchar(100) NOT NULL, " +
      "routeId varchar(100) NOT NULL, " +
      "stopId varchar (100) NOT NULL" +
      ")"
    , (err) => {
      if (err) throw err;
      client.query("SELECT * FROM users", (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
          self.users[row.googleId] = row;
        }
      });
    });

    return this;
  }

  /**
   * Get a user from the database. If the user isn't found, create it.
   */
  PostGres.prototype.getUser = function (googleId) {
    const user = this.users[googleId];
    if (user) return user;

    // User didn't exist, create new
    this.saveUser({
      googleId: googleId,
    });
    return this.users[googleId];
  };

  /**
   * Updates a user in the database
   */
  PostGres.prototype.saveUser = function (data) {
    this.users[data.googleId] = data;
  };

  /****************************** Public Methods ******************************/

  /**
   * Set the user's selected agency
   */
  PostGres.prototype.selectAgency = function (googleId, agencyId) {
    const user = this.getUser(googleId);
    user.agencyId = agencyId;
    this.saveUser(user);
  };

  /**
   * Set the user's selected route
   */
  PostGres.prototype.selectRoute = function (googleId, routeId) {
    const user = this.getUser(googleId);
    user.routeId = routeId;
    this.saveUser(user);
  };

  /**
   * Set the user's selected stop
   */
  PostGres.prototype.selectStop = function (googleId, stopId) {
    const user = this.getUser(googleId);
    user.stopId = stopId;
    this.saveUser(user);
  };

  /**
   * Getters
   */
  PostGres.prototype.getAgencyId = function (googleId) {
    return this.getUser(googleId).agencyId;
  };
  PostGres.prototype.getRouteId = function (googleId) {
    return this.getUser(googleId).routeId;
  };
  PostGres.prototype.getStopId = function (googleId) {
    return this.getUser(googleId).stopId;
  };

  /**
   * Page the user to the database.
   */
  PostGres.prototype.page = function (googleId) {
    const user = this.getUser(googleId);
    const self = this;

    if (user.id) {
      // Update
      self.client.query(
        "UPDATE users " +
        "SET agencyId = '" + user.agencyId + "' " +
        "SET routeId = '" + user.routeId + "' " +
        "SET stopId = '" + user.stopId + "' " +
        "WHERE id = '" + user.id + "'"
      );

    } else {
      // New addition to db
      self.client.query(
        "INSERT INTO users (googleId, agencyId, routeId, stopId) " +
        "VALUES ('" + googleId + "', '" + user.agencyId + "', '" + user.routeId + "', '" + user.stopId + "') " +
        "RETURNING id, googleId, agencyId, routeId, stopId"
      , (err, row) => {
        if (err) throw err;

        self.saveUser({
          id: row.id,
          googleId: row.googleId,
          agencyId: row.agencyId,
          routeId: row.routeId,
          stopId: row.stopId,
        });
      });
    }
  };

  return PostGres;

})();
