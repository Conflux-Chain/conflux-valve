const account = require("../account/account");

const command = {
  command: "account",
  description: "generate address && private key",
  builder: {},
  help: {
    usage:
      "valve account",
    options:[] 
  },
  run: account.run
};

module.exports = command;
