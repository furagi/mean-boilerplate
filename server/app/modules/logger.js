"use strict";

import chalk from "chalk";

let outer;
let addFormat;
let appName;

class Logger {
  constructor(_appName, _outer) {
    if(!outer) {
      outer = console;
      addFormat = true;
    }
    appName = _appName;
  }

  prepareLog(level, args) {
    let message;
    if(args[0] instanceof Error) {
      message = args[0].stack;
    } else if(typeof args[0] == "object") {
      message = JSON.stringify(args[0]);
    } else {
      message = args[0];
    }
    args[0] = `${appName}: ${message}`;
    if(addFormat) {
      let start = `[${level.toUpperCase()}] `;
      switch(level) {
        case "info":
          start = chalk.green(start);
          break;
        case "warn":
          start = chalk.yellow(start);
          break;
        case "error":
          start = chalk.red(start);
          break;
      }
      args[0] = `${start} ${args[0]}`;
    }
    return args;
  }

  info(...args) {
    const message = this.prepareLog("info", args);
    outer.info(...message);
  }

  warn(...args) {
    const message = this.prepareLog("warn", args);
    outer.info(...message);
  }

  error(...args) {
    const message = this.prepareLog("error", args);
    outer.info(...message);
  }

}

export default Logger;
