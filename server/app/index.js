"use strict";

import express from "express";
import methodOverride from "method-override";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "underscore";
import initRouters from "./routers";
import initModels from "./models";
import fillDbWithFixtures from "../db/fixtures";
import packageJson from "../../package.json";
import Logger from "./modules/logger";

let config;

class Application {

  static init(_config) {
    config = _config;
    global.logger = new Logger(this.name, console);
    const app = express();
    morgan.token("req-body", function (req, res) {
      return JSON.stringify(req.body || {});
    });
    app.use(morgan(`[:date[iso]] WARN: ":method :url :req-body :status ":user-agent" - :response-time ms`, {
      skip: function(req, res) {
        return res.statusCode < 400
      }
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(methodOverride());
    app.use("/", express["static"](path.resolve("public")));
    app.set("view engine", "pug");
    app.set("views", path.resolve("server/app/views"));
    return this.initDb()
    .then(function() {
      initRouters(app);
      return app;
    });
  }

  static get config() {
    return config;
  }

  static get name() {
    return packageJson.name;
  }

  static initDb() {
    mongoose.Promise = Promise;
    const dbConfig = this.config.mongodb;
    const dbUrl = `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`;
    return mongoose.connect(dbUrl)
    .then(function() {
      initModels();
      return fillDbWithFixtures();
    });
  }
}

export default Application;
