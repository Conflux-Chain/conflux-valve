var path = require("path");
var fs = require("fs-extra");
var assert = require("assert");
var gpk = require("../account/account.js")
const test = require('tape');

/*
describe("writeJson", function() {
    var destination = path.join(__dirname, ".jsonfile_test_tmp");
    console.log(destination);
    before("mkdir", function(done) {
    });

    after("remove tmp dir", function(done) {
        fs.remove(destination, done);
    });

    it("test generate the json file", function(done) {
        assert( fs.existsSync(path.join(destination + "/wallet.json")), "project should generate json file");
        return done();
    });
});
*/
var destination = path.join(__dirname, ".jsonfile_test_tmp");
function mk() {
        console.log(destination);

        fs.ensureDir(destination);
        gpk.generatePK(destination + "/");
 

}

test.onFinish(mk)

test('writeJson', t => {
       t.equal(fs.existsSync(path.join(destination + "/wallet.json")), true, "if  equal is true, wallet.json exists");
        t.end();


    }



)
