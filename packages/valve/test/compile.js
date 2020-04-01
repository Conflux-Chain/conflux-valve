var solc = require('solc');
var fs = require('fs');

var input = {};
var files = ['FC.sol', 'FCPausable.sol', 'FCRoles.sol', 'IFC.sol', 'Roles.sol', 'SafeMath.sol'];
var i;
for (i in files) {
    var file = files[i];
    input[file] = {
        content: fs.readFileSync("../contracts/" + file, 'utf8')
    };
}
for (i = 0; i < 10; i++) {
    var output = JSON.parse(solc.compileStandardWrapper(JSON.stringify({
        language: 'Solidity',
        settings: {
            optimizer: {
                enabled: true
            },
            outputSelection: {
                '*': {
                    '*': ['evm.bytecode']
                }
            }
        },
        sources: input
    })))};

    console.log(output)
