"use strict";

const env = process.env.NODE_ENV || "local";
const settings = require(`./${env}.json`);

class Config {

  constructor() {
    for(let key in settings) {
      Object.defineProperty(this, key, {
        value: settings[key],
        writable: false,
        configurable: false,
        enumerable: false
      });
    }
  }

  get env() {
    return env;
  }

  toString() {
    return JSON.stringify(settings);
  }

}

export default Config;
