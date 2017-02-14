"use strict";

import { run as migrate, changeWorkingDirectory, setDbConfig } from "mongodb-migrate";
import path from "path";

const env = process.env.NODE_ENV || "local";
const config = require(path.resolve(__dirname, `../config/${env}.json`));
const configString = JSON.stringify({
  host: config.mongodb.host,
  port: config.mongodb.port,
  db: config.mongodb.name,
  username: config.mongodb.user,
  password: config.mongodb.password
});
const DIR = path.resolve(__dirname);
const task = process.argv[2];

setDbConfig(configString);
changeWorkingDirectory(DIR);

switch(task) {
  case "up":
    up(process.argv[3]);
    break;
  case "down":
    down(process.argv[3]);
    break;
  case "create":
    create(process.argv[3]);
    break;
  default:
    process.exit(0);
}

function up(toRevision) {
  migrate("up", toRevision);
}

function down(toRevision) {
  migrate("down", toRevision);
}

function create(title) {
  migrate("create", title);
}
