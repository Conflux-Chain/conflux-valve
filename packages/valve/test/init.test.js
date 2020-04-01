var path = require("path");
var fs = require("fs-extra");
var assert = require("assert");
var init = require("../init/init.js")
const test = require('tape');
//var Box = require("truffle-conflux-box");

//var TRUFFLE_BOX_DEFAULT = "https://github.com/liuis/truffle-conflux-init-default";
/*
describe("createProjectStructure", function() {
    var destination = path.join(__dirname, ".project_test_tmp");
    
    before("mkdir", async function() {
        fs.ensureDir(destination);
        await init.createProjectStructure(destination);
    });

    after("remove tmp dir", function(done) {
        fs.remove(destination, done);
    });

    it("remove gitignore && readme file", function(done) {

        // Now assert the README.md and the .gitignore file were removed.
        assert(fs.existsSync(path.join(destination, "README.md")) == false, "README.md didn't get removed!");
        assert(fs.existsSync(path.join(destination, ".gitignore")) == false, ".gitignore didn't get removed!");
    });

    it("won't re-init if anything exists in the destination folder", function(done) {
        this.timeout(5000);
        var contracts_directory = path.join(destination, "contracts");

        // Assert our precondition
        assert(fs.existsSync(contracts_directory), "contracts directory should exist for this test to be meaningful");
    });
});
*/

var destination = path.join(__dirname, ".project_test_tmp");

function mk() {
        console.log(destination);

        fs.ensureDir(destination);
        init.createProjectStructure(destination);
 
}

test.onFinish(mk)
test('createProjectStructure', t => {

        t.equal(fs.existsSync(path.join(destination, "README.md")) ,false, "README.md didn't get removed!");
        t.equal(fs.existsSync(path.join(destination, ".gitignore")), false, ".gitignore didn't get removed!");
        t.end();


}




)
