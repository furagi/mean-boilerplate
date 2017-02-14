"use strict";

import http from "http";
import Config from "./config";
import Application from "./app";

const config = new Config();
global.App = Application;

App.init(config)
.then(function(app) {
  http.createServer(app).listen(App.config.port);
  const message = `Server started at port ${App.config.port} with config ${App.config.toString()} in ${App.config.env} mode`;
  logger.info(message);
}).catch(function(err) {
  logger.error(err);
  process.exit(1);
});
