const ReplManager = require("./repl");
const Command = require("./command_task");
// We don't load web3 temporarily
//const ConfluxWeb = require('conflux-web');
//const confluxWeb = new ConfluxWeb('http://0.0.0.0:12537');
const { Conflux, util, provider } = require('js-conflux-sdk');
 const cfx = new Conflux({
    url: 'http://0.0.0.0:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
    //logger: console,
  });
//var provider = new ConfluxWeb.providers.HttpProvider("http://0.0.0.0:12537");
var providerJs = provider("http://0.0.0.0:12537");
const provision = require("@truffle/provisioner");
//load valve  contract object 
const contract = require("valve-contract");
const vm = require("vm");
const expect = require("@truffle/expect");
const ConffleError = require("@truffle/error");
const fse = require("fs-extra");
const path = require("path");
const EventEmitter = require("events");
const solpath = path.resolve(process.cwd(), '');

const processInput = input => {
    const inputComponents = input.trim().split(" ");
    if (inputComponents.length === 0) return input;

    if (inputComponents[0] === "valve") {
        return inputComponents.slice(1).join(" ");
    }
    return input.trim();
};

class Console extends EventEmitter {
    constructor(tasks, options) {
        super();
        EventEmitter.call(this);


        this.options = options;

        this.repl = options.repl || new ReplManager(options);
        this.command = new Command(tasks);

        // not load the web3
        this.cfx = cfx;

        // Bubble the ReplManager's exit event
        this.repl.on("exit", () => this.emit("exit"));
    }

    start(callback) {
        if (!this.repl) this.repl = new Repl(this.options);

        // TODO: This should probalby be elsewhere.
        // It's here to ensure the repl manager instance gets
        // passed down to commands.
        this.options.repl = this.repl;

        try {
            //this.interfaceAdapter.getAccounts().then(fetchedAccounts => {

            const abstractions = this.provision();
            //console.log("abstractions: " + abstractions);
            this.repl.start({
                //not prompt anything  network : localhost_docker
                prompt: "valve(localhost_docker)> ",
                context: {
                    cfx: this.cfx
                },
                interpreter: this.interpret.bind(this),
                done: callback
            });

            this.resetContractsInConsoleContext(abstractions);
            //});
        } catch (error) {
            console.log(
                "Unexpected error: Cannot provision contracts while instantiating the console."
            );
            console.log(error.stack || error.message || error);
        }
    }

    provision() {
        let files;
        /*
        try {
          const unfilteredFiles = fse.readdirSync(
            this.options.contracts_build_directory
          );
          files = unfilteredFiles.filter(file => file.match(".json") !== null);
        } catch (error) {
          // Error reading the build directory? Must mean it doesn't exist or we don't have access to it.
          // Couldn't provision the contracts if we wanted. It's possible we're hiding very rare FS
          // errors, but that's better than showing the user error messages that will be "build folder
          // doesn't exist" 99.9% of the time.
        }
        */
        let jsonBlobs = [];

        var rp = solpath + '/build/Link.json';
        var data = fse.readFileSync(rp);
        let RawData = JSON.parse(data);
        var contracts = RawData.noNeedlink.concat(RawData.Linked);
        for (let name of contracts) {
            const body = fse.readFileSync(solpath + "/build/" + name + ".json");
            jsonBlobs.push(JSON.parse(body));
        }

        const abstractions = jsonBlobs.map(json => {

            const abstraction = contract({
                contractName: json.contractName,
                abi: json.abi, // optional
                bytecode: json.bytecode, // optional
                address: json.contractAddress, // optional
            });
            abstraction.setProvider(providerJs);
            if (typeof abstraction.currentProvider.sendAsync !== "function") {
                abstraction.currentProvider.sendAsync = function() {
                    return abstraction.currentProvider.send.apply(abstraction.currentProvider, arguments);
                };
            };
            //console.log("abstraction::", abstraction)
            provision(abstraction, this.options);
            return abstraction;
        });

        this.resetContractsInConsoleContext(abstractions);

        return abstractions;
    }

    resetContractsInConsoleContext(abstractions) {
        abstractions = abstractions || [];

        const contextVars = {};

        abstractions.forEach(abstraction => {
            contextVars[abstraction.contract_name] = abstraction;
        });

        this.repl.setContextVars(contextVars);
    }

    interpret(input, context, filename, callback) {
            const processedInput = processInput(input);
            if (
                this.command.getCommand(processedInput, this.options.noAliases) != null
            ) {
                return this.command.run(processedInput, this.options, error => {
                    if (error) {
                        // Perform error handling ourselves.
                        if (error instanceof ConffleError) {
                            console.log(error.message);
                        } else {
                            // Bubble up all other unexpected errors.
                            console.log(error.stack || error.toString());
                        }
                        return callback();
                    }

                    // Reprovision after each command as it may change contracts.
                    try {
                        this.provision();
                        callback();
                    } catch (error) {
                        // Don't pass abstractions to the callback if they're there or else
                        // they'll get printed in the repl.
                        callback(error);
                    }
                });
            }

            // Much of the following code is from here, though spruced up:
            // https://github.com/nfcampos/await-outside

            /*
            - allow whitespace before everything else
            - optionally capture `var|let|const <varname> = `
              - varname only matches if it starts with a-Z or _ or $
                and if contains only those chars or numbers
              - this is overly restrictive but is easier to maintain
            - capture `await <anything that follows it>`
            */
            let includesAwait = /^\s*((?:(?:var|const|let)\s+)?[a-zA-Z_$][0-9a-zA-Z_$]*\s*=\s*)?(\(?\s*await[\s\S]*)/;

            const match = processedInput.match(includesAwait);
            let source = processedInput;
            let assignment = null;

            // If our code includes an await, add special processing to ensure it's evaluated properly.
            if (match) {
                let assign = match[1];
                const expression = match[2];

                const RESULT = "__await_outside_result";

                // Wrap the await inside an async function.
                // Strange indentation keeps column offset correct in stack traces
                source = `(async function() { try { ${
        assign ? `global.${RESULT} =` : "return"
      } (
  ${expression.trim()}
  ); } catch(e) { global.ERROR = e; throw e; } }())`;

      assignment = assign
        ? `${assign.trim()} global.${RESULT}; void delete global.${RESULT};`
        : null;
    }

    const runScript = script => {
      const options = {
        displayErrors: true,
        breakOnSigint: true,
        filename: filename
      };
      return script.runInContext(context, options);
    };

    let script;
    try {
      const options = { displayErrors: true, lineOffset: -1 };
      script = vm.createScript(source, options);
    } catch (error) {
      // If syntax error, or similar, bail.
      return callback(error);
    }

    // Ensure our script returns a promise whether we're using an
    // async function or not. If our script is an async function,
    // this will ensure the console waits until that await is finished.
    Promise.resolve(runScript(script))
      .then(value => {
        // If there's an assignment to run, run that.
        if (assignment) return runScript(vm.createScript(assignment));
        return value;
      })
      .then(value => {
        // All good? Return the value (e.g., eval'd script or assignment)
        callback(null, value);
      })
      .catch(callback);
  }
}

module.exports = Console;
