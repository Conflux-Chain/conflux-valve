const deploy = require("../deploy/deploy");

const command = {
  command: "deploy",
  description: "deploy contracts",
  builder: {},
  help: {
    usage:
      "valve deploy",
    options:[] 
  },
  run: deploy.run
};

module.exports = command;
