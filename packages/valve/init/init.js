const Box = require('./box');
const unboxOptions = {
    force: false
};


async function run() {

    createProjectStructure();

}

function createProjectStructure(dir = "./") {
    console.log("start the example procject, pls wait....")

    Box.unbox("https://github.com/liuis/truffle-conflux-init-default", dir, unboxOptions);
}

module.exports = {
    run
}
