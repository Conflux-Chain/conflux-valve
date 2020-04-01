//Parent  get message

const EventEmitter= require("events");
const {fork}= require("child_process");
const path = require('path');


class ChainService extends EventEmitter {
  constructor() {
    super();
    this.child = null;
    this.serverStarted = false;
    this.setMaxListeners(1);
  }

  start() {
    if (this.child === null) {
      let chainPath = path.join(__dirname, "./", "chain.js");
      const options = {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      };
      this.child = fork(chainPath, [], options);
      this.child.on("message", message => {
        if (message.type == "process-started") {
          this.emit("start");
        }
        if (message.type == "server-started") {
          this.serverStarted = true;
        }
        if (message.type == "server-stopped") {
          this.serverStarted = false;
        }
        this.emit(message.type, message.data);
      });
      this.child.on("error", error => {
        this.emit("error", error);
      });
      this.child.on("exit", this._exitHandler);
      this.child.stdout.on("data", data => {
        // Remove all \r's and the final line ending
        this.emit(
          "stdout",
          data
            .toString()
            .replace(/\r/g, "")
            .replace(/\n$/, ""),
        );
      });
      this.child.stderr.on("data", data => {
        // Remove all \r's and the final line ending
        this.emit(
          "stderr",
          data
            .toString()
            .replace(/\r/g, "")
            .replace(/\n$/, ""),
        );
      });
    } else {
      this.emit("start");
    }
  }
  
  /* 通过config setting 启动，keep
  startServer(settings) {
    if (this.child !== null) {
      let options = fn(setting)
      this.child.send({
        type: "start-server",
        data: options,
      });
    }
  }
  */
  stopServer() {
    return new Promise(resolve => {
      this.once("server-stopped", () => {
        resolve();
      });
      if (this.child !== null) {
        this.child.send({
          type: "stop-server",
        });
      } else {
        resolve();
      }
    });
  }

  stopProcess() {
    if (this.child !== null) {
      this.child.removeListener("exit", this._exitHandler);
      if (this.child) {
        this.child.kill("SIGINT");
      }
    }
  }

  isServerStarted() {
    return this.serverStarted;
  }

  _exitHandler(code, signal) {
    if (code != null) {
      this.emit(
        "error",
        `Blockchain process exited prematurely with code '${code}', due to signal '${signal}'.`,
      );
    } else {
      this.emit(
        "error",
        `Blockchain process exited prematurely due to signal '${signal}'.`,
      );
    }
  }
}

module.exports = ChainService; 
