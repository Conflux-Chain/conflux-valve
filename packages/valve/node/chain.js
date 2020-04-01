#!/usr/bin/env node

//CHILD get message
//
var logging = require("./logging");
const { Conflux, util } = require('js-conflux-sdk');
var CHAINVERSION = "0.2.3";

if (!process.send) {
  console.log("Not running as child process. Throwing.");
  throw new Error("Must be run as a child process!");
}

process.removeAllListeners("uncaughtException");

process.on("unhandledRejection", err => {
  //console.log('unhandled rejection:', err.stack || err)
  process.send({ type: "error", data: copyErrorFields(err) });
});

process.on("uncaughtException", err => {
  //console.log('uncaught exception:', err.stack || err)
  process.send({ type: "error", data: copyErrorFields(err) });
});

var server;
var blockInterval;
var dbLocation;

function stopServer(callback) {
  callback = callback || function() {};

  clearInterval(blockInterval);

  if (server) {
    server.close(callback);
  } else {
    process.send({ type: "server-stopped" });
    callback();
  }
}

function startServer(options) {
  stopServer(function() {
    let sanitizedOptions = Object.assign({}, options);

    const logToFile =
      options.logDirectory !== null && typeof options.logDirectory === "string";

    if (typeof options.logger === "undefined") {
      if (logToFile) {
        logging.generateLogFilePath(options.logDirectory);

        options.logger = {
          log: message => {
            if (typeof message === "string") {
              logging.logToFile(message);
            }
          },
        };
      } else {

        options.logger = {
          log: message => {
            if (
              typeof message === "string" &&
              (options.verbose || message.indexOf(" ") == 0)
            ) {
              console.log(message);
            }
          },
        };
      }
    }

    const startingMessage = `Starting conflux-chain server version : 0.2.3 `;
    console.log(startingMessage);
    if (logToFile) {
      logging.logToFile(startingMessage);
    }

    server = child_process.spawn('./conflux-chain-release/start-chain.sh', []);
    server.stdout.setEncoding('utf8');
    server.stdout.on('data', function(data) {
        //nohup 启动，stdout啥都没有
        console.log(data);
    });

    const cfx = new Conflux({
    url: 'http://0.0.0.0:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
    logger: console,
    });
    //server.listen(options.port, options.hostname, function(err, result) {
    cfx.getEpochNumber().then( function(err, result) {
      if (err) {
        process.send({ type: "start-error", data: err });
        return;
      }

      process.send({ type: "server-started", data: "currentEpoch:"  +  str(result)});

      console.log("Confux-Chain node  started successfully!");
      console.log("Waiting for requests...");
    });

    server.on("close", function() {
      process.send({ type: "server-stopped" });
    });
  });
}

process.on("message", function(message) {
  //console.log("CHILD RECEIVED", message)
  switch (message.type) {
    case "start-server":
      startServer(message.data);
      break;
    case "stop-server":
      stopServer();
      break;
  }
});

function copyErrorFields(e) {
  let err = Object.assign({}, e);

  // I think these properties aren't enumerable on Error objects, so we copy
  // them manually if we don't do this, they aren't passed via IPC back to the
  // main process
  err.message = e.message;
  err.stack = e.stack;
  err.name = e.name;

  return err;
}

process.send({ type: "process-started" });

// If you want to test out an error being thrown here
// setTimeout(function() {
//   throw new Error("Error from chain process!")
// }, 4000)
