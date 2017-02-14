"use strict";

import express from "express";
import path from "path";
import ApplicationController from "../controllers/application";

export default function(app) {
  const appController = new ApplicationController();
  app.get("/", (...args) => appController.index(...args));
};
