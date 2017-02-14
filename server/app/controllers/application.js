"use strict";

import path from "path";

class ApplicationController {

  index(req, res) {
    res.locals.title = App.name;
    res.render("index.pug");
  }

}

export default ApplicationController;
