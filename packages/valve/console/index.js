const consoleTask = require("./console");
const commands = require('./commands_index.js');

function done() {

    console.log("Conflux is awesome!!!, byebye!!!");
}

function run() {

    const excluded = ["console", "init", "watch", "develop"];

    const availableCommands = Object.keys(commands).filter(name => {
        return excluded.indexOf(name) === -1;
    });

    const consoleCommands = {};
    availableCommands.forEach(name => {
        consoleCommands[name] = commands[name];
    });

    const c = new consoleTask(consoleCommands, []);
    c.start(done);

};

module.exports = {
    run
}
