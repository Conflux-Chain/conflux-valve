//const BN = require('bn.js');
const jayson = require('jayson');
const client = jayson.client.http('http://localhost:12537');
const { Conflux, util} = require('js-conflux-sdk');
const cfx = new Conflux({
    url: 'http://0.0.0.0:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
  });


//const ConfluxWeb = require('conflux-web');
//const cfxNum = new BN('3000000000000000000');
var linker = require('solc/linker');
//const confluxWeb = new ConfluxWeb('http://0.0.0.0:12537');
//const mnemonicInfo = require("valve-utils/mnemonic");
var fs = require('fs');
var request = require('request');
const path = require('path');


const solpath = path.resolve(process.cwd(), '..');
const GENESIS_PRI_KEY = "46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f";
const GENESIS_ADDRESS = "0xfbe45681ac6c53d5a40475f7526bac1fe7590fb8";


/**
 * check num is hex
 *
 * @name isHex
 * @function
 * @access public
 * @param {number} num hex string?
 * @returns {boolean} true or false
 */
function isHex(num) {
    return Boolean(num.match(/^0x[0-9a-f]+$/i))
};


/**
 * check arg is a obj
 *
 * @name isEmptyObject
 * @function
 * @access public
 * @param {object} obj object maybe [], {x,x,x}
 * @returns {boolean} true is object
 */
function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
};

/**
 * black the code sothing times
 *
 * @name sleep
 * @function
 * @access public
 * @param {number} ms int
 * @returns {promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * write some key to json file
 *
 * @name writeJsonto
 * @function
 * @access public
 * @param {string} key want to write json key to file
 * @param {solidity file name} solfile solidity file name 
 * @param {string} newValues put the new value 
 * @returns {err| promise the new json} return the pretty format json 
 */
async function writeJsonto(key, solfile, newValues) {
    var fs = require('fs');
    var file = JSON.parse(fs.readFileSync(solpath + "/build/" + solfile, 'utf8'));
    file[key] = newValues;
    return new Promise(function(resolve, reject) {
        fs.writeFile(solpath + "/build/" + solfile, JSON.stringify(file, null, 4), function(err) {
            if (err) reject(err);
            resolve(JSON.stringify(file, null, 4));
        });




    })
}

/**
 * deploy the compiled the contract to the conflux-chain 
 *
 * @name deployContract
 * @function
 * @access public
 * @param {hex} address hex prefix - '0x'
 * @param {hex} privateKeys private keys  prefix - '0x'
 * @param {string} name conpiled the contract file name
 */
async function deployContract(address, privateKeys, name) {


    //await confluxWeb.cfx.accounts.wallet.add({
    //    privateKey: privateKeys,
    //    address: address
    //});


    let rawdata = fs.readFileSync(solpath + "/build/" + name + ".json");
    let fd = JSON.parse(rawdata);
    //console.log("bytecode:", "0x" + fd.bytecode)
    code = "0x" + fd.bytecode;
    abi = fd.abi;
    if (isHex(code)) {
        //const add = confluxWeb.cfx.accounts.wallet[0].address;
        return cfx.getTransactionCount(address).then(async(nonceValue) => {
            //console.log("nonceValue:", nonceValue)
            let gasPrice = (await cfx.getGasPrice()).toString();
            value = util.unit.fromCFXToDrip(0).toString();
            const txParams = {
                from: address,
                nonce: nonceValue, // make nonce appropriate
                gasPrice: 100,
                gas: 1000000,
                value: value,
                to: null,
                data: code
            };

            //let gas = await cfx.estimateGas(txParams);
            //txParams.gas = gas;
            const account = cfx.Account(privateKeys);
            if (abi) {
                const rawTransaction = account.signTransaction(txParams);
                console.log('raw transaction: ', rawTransaction);
                return cfx.sendRawTransaction(rawTransaction.serialize()).then((transactionHash) => {
                    console.log('transaction hash from RPC: ', transactionHash);
                    localhost_waitBlock(transactionHash, solfile)
                })
                //await confluxWeb.cfx.signTransaction(txParams)
                //    .then(async(encodedTransaction) => {
                //        const {
                //            rawTransaction
                //        } = encodedTransaction;
                //        //console.log('raw transaction: ', rawTransaction);
                //        await confluxWeb.cfx.sendSignedTransaction(rawTransaction).then(async(transactionHash) => {
                //            console.log('transaction hash from RPC: ', transactionHash);
                //            await localhost_waitBlock(transactionHash, name + ".json")
                //        })
                //    }).catch(console.error);

            }
        })
    } else {
        //link 
        console.log("----------------------------------------------------")
        console.log("\n")
        console.log("The bytecode is not a hex, you may be a reference to other sol file, try to link!!!")

        keys = Object.keys(fd.linkReferences)
        var tempJson = {};
        for (var i = 0; i < keys.length; i++) {
            let solRawData = fs.readFileSync(solpath + "/build/" + keys[i] + ".json");
            let solFd = JSON.parse(solRawData);
            cAdd = solFd.contractAddress;
            keys2 = Object.keys(fd.linkReferences[keys[i]])
            k = keys + ":" + keys2,
                tempJson[k] = cAdd;
        }
        console.log("try to list the link reference object:", tempJson);
        /* 
         * example 
        bytecode = linker.linkBytecode(mc.bytecode, {
            'ConvertLib.sol:ConvertLib': '0xe4daa3e81a8c7c67d868fe21d0070ba29d61e5c9'
        });
        *
        */
        NewByteCode = linker.linkBytecode(fd.bytecode, tempJson);
        await writeJsonto("bytecode", name + ".json", NewByteCode);
        let gasPrice = (await cfx.getGasPrice()).toString();
        value = util.unit.fromCFXToDrip(0).toString();
        return cfx.getTransactionCount(address).then(async(nonceValue) => {
            const txParams = {
                from: address,
                nonce: nonceValue, // make nonce appropriate
                gasPrice: 100,
                gas :1000000,
                value: value,
                to: null,
                data: "0x" + NewByteCode
            };

            //let gas = await cfx.estimateGas(txParams);
            //txParams.gas = gas;
            const account = cfx.Account(privateKeys);
            if (abi) {
                const rawTransaction = account.signTransaction(txParams);
                console.log('raw transaction: ', rawTransaction);
                return cfx.sendRawTransaction(rawTransaction.serialize()).then((transactionHash) => {
                    console.log('transaction hash from RPC: ', transactionHash);
                    localhost_waitBlock(transactionHash, solfile)
                })
                ////await deploy(txParams, abi, name + ".json");
                //await confluxWeb.cfx.signTransaction(txParams)
                //    .then(async(encodedTransaction) => {
                //        const {
                //            rawTransaction
                //        } = encodedTransaction;
                //        //console.log('raw transaction: ', rawTransaction);
                //        await confluxWeb.cfx.sendSignedTransaction(rawTransaction).then(async(transactionHash) => {
                //            console.log('transaction hash from RPC: ', transactionHash);
                //            await localhost_waitBlock(transactionHash, name + ".json")
                //                //
                //        })
                //    }).catch(console.error);

            }
        })

    }
}

/**
 * want to package the block, try to 15, must be the promise
 *
 * @name package
 * @function
 * @access public
 * @returns {Promise} Promise
 */
/**
 */
function package() {
    array = [];
    for (var i = 0, len = 15; i < len; i++) {
        array.push(
            new Promise((resolve, reject) =>
                client.request('generateoneblock', [1, 300000], function(err, error, result) {
                    if (err) reject(err);
                    resolve("generateoneblock : " + result);
                })
            )
        )

    }
    return Promise.all(array);
}

/**
 * when the docker chain package the transaction, get the transaction receipt
 *
 * @name localhost_waitBlock
 * @function
 * @access public
 * @param {hex } txHash transaction hex values
 * @param {want to update the contract compiled sol.json file name} solfile contract name sol filename
 * @returns {Promise resolve | reject} Promise return
 */
async function localhost_waitBlock(txHash, solfile) {
    await package();
    await cfx.getTransactionReceipt(txHash).then(async(receipt) => {
        if (receipt !== null) {
            cAddress = receipt["contractCreated"]
            console.log("Your contract has been deployed at :" + cAddress);
            await writeJsonto("contractAddress", solfile, cAddress);
            return Promise.resolve(cAddress);
        } else {
            return Promise.reject("generateBlock err, 15 blocks");
        }
    })

}


/**
 * paralle the array 
 *
 * @name asyncForEach
 * @function
 * @access public
 * @param {array} array want to paralle the array, eg:[1,2,3,4]
          const contracts = ['ConvertLib.sol', 'MetaCoin.sol'];
 * @param {function} callback callback function
 * @returns {callback fun} function
 */
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

/**
 * deploy the contract, warning: all the contract will be deploy
 *
 * @name newContract
 * @function
 * @access public
 * @param {hex|address hex value} add address hex values
 * @param {private key | hex values} pk private key hex values
 *        var add = "0xe1680683be13895b59c94eaf61818975a0d105dd";
          var pk = "0x91594bd85fec9695a26ed630f536195b5f8c448560f46d68512e2efcd837d0ac";
 */
async function newContract(add, pk) {
    var rp = solpath + '/build/Link.json';
    var data = fs.readFileSync(rp);
    let RawData = JSON.parse(data);
    var contracts = RawData.noNeedlink.concat(RawData.Linked);
    console.log("new deployed contract order:", contracts)
    for (let x of contracts) {
         await deployContract(add, pk, x)
    }
    // await asyncForEach(contracts, async x => {
    //      await deployContract(add, pk, x)
    // })
};

module.exports = {
    newContract: newContract
}
