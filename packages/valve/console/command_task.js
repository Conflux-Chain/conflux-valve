const TaskError = require("./taskerror");
const yargs = require("yargs/yargs");
//const { bundled, core } = require("../lib/version").info();
const OS = require("os");
//const analytics = require("../lib/services/analytics");
const { extractFlags } = require("./utils"); // Contains utility methods

class Command {
  constructor(commands) {
    this.commands = commands;
    console.log("commands:", commands);
    let args = yargs();
    //console.log("args:", args);
    Object.keys(this.commands).forEach(function(command) {
      args = args.command(commands[command]);
    });

    this.args = args;
  }

  getCommand(inputStrings, noAliases) {
    const argv = this.args.parse(inputStrings);

    if (argv._.length === 0) {
      return null;
    }

    const firstInputString = argv._[0];
    let chosenCommand = null;

    // If the command wasn't specified directly, go through a process
    // for inferring the command.
    if (this.commands[firstInputString]) {
      chosenCommand = firstInputString;
    } else if (noAliases !== true) {
      let currentLength = 1;
      const availableCommandNames = Object.keys(this.commands);

      // Loop through each letter of the input until we find a command
      // that uniquely matches.
      while (currentLength <= firstInputString.length) {
        // Gather all possible commands that match with the current length
        const possibleCommands = availableCommandNames.filter(
          possibleCommand => {
            return (
              possibleCommand.substring(0, currentLength) ===
              firstInputString.substring(0, currentLength)
            );
          }
        );

        // Did we find only one command that matches? If so, use that one.
        if (possibleCommands.length === 1) {
          chosenCommand = possibleCommands[0];
          break;
        }

        currentLength += 1;
      }
    }

    if (chosenCommand == null) {
      return null;
    }

    const command = this.commands[chosenCommand];

    return {
      name: chosenCommand,
      argv,
      command
    };
  }

  run(inputStrings, options, callback) {
    const result = this.getCommand(inputStrings, options.noAliases);

    if (result == null) {
      return callback(
        new TaskError(
          "Cannot find command based on input: " + JSON.stringify(inputStrings)
        )
      );
    }

    const argv = result.argv;

    // Remove the task name itself.
    if (argv._) argv._.shift();

    // We don't need this.
    delete argv["$0"];

    // Some options might throw if options is a Config object. If so, let's ignore those options.
    const clone = {};
    Object.keys(options).forEach(key => {
      try {
        clone[key] = options[key];
      } catch (e) {
        // Do nothing with values that throw.
      }
    });

    // Check unsupported command line flag according to the option list in help
    try {
      // while in `console` & `develop`, input is passed as a string, not as an array
      if (!Array.isArray(inputStrings)) inputStrings = inputStrings.split(" ");
      // Method `extractFlags(args)` : Extracts the `--option` flags from arguments
      const inputOptions = extractFlags(inputStrings);
      const validOptions = result.command.help.options
        .map(item => {
          let opt = item.option.split(" ")[0];
          return opt.startsWith("--") ? opt : null;
        })
        .filter(item => {
          return item != null;
        });

      let invalidOptions = inputOptions.filter(
        opt => !validOptions.includes(opt)
      );

      // TODO: Remove exception for 'truffle run' when plugin options support added.
      if (invalidOptions.length > 0 && result.name !== "run") {
        if (options.logger) {
          const log = options.logger.log || options.logger.debug;
          log(
            "> Warning: possible unsupported (undocumented in help) command line option: " +
              invalidOptions
          );
        }
      }

      const newOptions = Object.assign({}, clone, argv);

      result.command.run(newOptions, callback);
      //analytics.send({
      //  command: result.name ? result.name : "other",
      //  args: result.argv._,
      //  version: bundled || "(unbundled) " + core
      //});
    } catch (err) {
      callback(err);
    }
  }

  displayGeneralHelp() {
    this.args
      .usage(
        "valve v" +
          //(bundled || core) +
          " - a development framework for Conflux chain" +
          OS.EOL +
          OS.EOL +
          "Usage: valve <command> [options]"
      )
      .epilog("See more at http://conflux-chain.org/docs")
      .showHelp();
  }
}

module.exports = Command;
