const rlp = require('rlp');
const keccak = require('keccak');
var jayson = require('jayson');
var client = jayson.client.http('http://localhost:12537');
var linker = require('solc/linker');

// use the testnet 
//'http://testnet-jsonrpc.conflux-chain.org:12537';
// use the local node
//'http://0.0.0.0:12537';
const { Conflux, util} = require('js-conflux-sdk');
const cfx = new Conflux({
    url: 'http://0.0.0.0:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
  });


var fs = require('fs');
var request = require('request');

const GENESIS_PRI_KEY = "46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f";
const GENESIS_ADDRESS = "0xfbe45681ac6c53d5a40475f7526bac1fe7590fb8";

async function run(address, privateKeys, name) {

    try {
        console.log("address:" + address, "privateKeys:" + privateKeys)

        deployContract(address, privateKeys, name);

    } catch (e) {
        console.error(e);
    }
}


function deploy(account, argument,  solfile) {
    const rawTransaction = account.signTransaction(argument);
    //console.log('raw transaction: ', rawTransaction);
    return cfx.sendRawTransaction(rawTransaction.serialize()).then((transactionHash) => {
        //console.log('transaction hash from RPC: ', transactionHash);
        localhost_waitBlock(transactionHash, solfile)
    })
    //confluxWeb.cfx.signTransaction(argument)
    //    .then((encodedTransaction) => {
    //        const {
    //            rawTransaction
    //        } = encodedTransaction;
    //        return confluxWeb.cfx.sendSignedTransaction(rawTransaction).then((transactionHash) => {
    //            console.log('transaction hash from RPC: ', transactionHash);
    //            localhost_waitBlock(transactionHash, solfile)
    //        })
    //    }).catch(console.error);
};

function isHex(num) {
    return Boolean(num.match(/^0x[0-9a-f]+$/i))
};

async function deployContract(address, privateKeys, name) {
    //await confluxWeb.cfx.accounts.wallet.add({
    //    privateKey: privateKeys,
    //    address: address
    //});
    const account = cfx.Account(privateKeys);
    let rawdata = fs.readFileSync("./build/" + name + ".sol.json");
    let fd = JSON.parse(rawdata);
    console.log("bytecode:", "0x" + fd.bytecode)
    code = "0x" + fd.bytecode;
    abi = fd.abi;
    if (isHex(code)) {
        cfx.getTransactionCount(address).then(async(nonceValue) => {
            //console.log("nonceValue:", nonceValue)
            let gasPrice = (await cfx.getGasPrice()).toString();
            value = util.unit.fromCFXToDrip(0).toString();
            const txParams = {
                from : address,
                nonce: nonceValue, // make nonce appropriate
                gasPrice: 100,
                gas: 1000000,
                value: value,
                to: null,
                data: code
            };

            //let gas = await cfx.estimateGas(txParams);
            //txParams.gas = gas;
            if (abi) {
                deploy(account, txParams, name + ".sol.json");
            }
        })
    } else {
        //link 
        console.log("----------------------------------------------------")
        console.log("\n")
        console.log("The bytecode is not a hex, you may be a reference to other sol file, try to link!!!")

        keys = Object.keys(fd.linkReferences)
        console.log(keys)
        var tempJson = {};
        for (var i = 0; i < keys.length; i++) {
            //获取sol deployed的contract address
            console.log(keys[i]);
            let solRawData = fs.readFileSync("./build/" + keys[i] + ".json");
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
        writeJsonto("bytecode", name + ".sol.json", NewByteCode);
        //const add = confluxWeb.cfx.accounts.wallet[0].address;
        cfx.getTransactionCount(address).then(async(nonceValue) => {
            //gasPrice = await cfx.getGasPrice();
            value = util.unit.fromCFXToDrip(0).toString();
            const txParams = {
                from: address,
                nonce: nonceValue, // make nonce appropriate
                gasPrice: 100,
                gas: 1000000,
                value: value,
                to: null,
                data: "0x" + NewByteCode
            };

            //let gas = await cfx.estimateGas(txParams);
            //txParams.gas = gas;
            if (abi) {
                deploy(account, txParams,  name + ".sol.json");
            }
        })

    }
}

//-------------------------------------------------------------------------------------------------
// waitBlock || wait_local_block  
// Utils function
//  
//-------------------------------------------------------------------------------------------------


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitBlock(txHash, abi) {

    return cfx.getTransactionReceipt(txHash).then(
        (receipt) => {
            console.log("Note that it might take some sceonds for the block to propagate befor it's visible in conflux chain");
            if (receipt !== null) {
                contractAddress = receipt["contractCreated"]
                console.log("Your contract has been deployed at :" + contractAddress);
            } else {
                sleep(4000);
                return waitBlock(txHash, abi)
            }
        })

}

function localhost_waitBlock(txHash, solfile) {


    for (var i = 0, len = 5; i < len; i++) {
        client.request('generateoneblock', [1, 300000], function(err, error, result) {
            if (err) throw err;
            //console.log("generateoneblock : " + result);
        });

    }

    return cfx.getTransactionReceipt(txHash).then(
        (receipt) => {
            //console.log("Note that it might take some sceonds for the block to propagate befor it's visible in conflux");
            if (receipt !== null) {
                //console.log("receipt:", receipt.stateRoot);
                //console.log("Your account has been receiver some cfx coin");
                cAddress = receipt["contractCreated"]
                console.log("Your contract has been deployed at :" + cAddress);
                writeJsonto("contractAddress", solfile, cAddress);
                //confluxWeb.cfx.accounts.wallet.remove(GENESIS_ADDRESS)
            } else {
                return localhost_waitBlock(txHash, solfile)
            }
        })
}

function writeJsonto(key, solfile, newValues) {
    var fs = require('fs');
    var file = JSON.parse(fs.readFileSync("./build/" + solfile, 'utf8'));
    file[key] = newValues;
    fs.writeFile("./build/" + solfile, JSON.stringify(file, null, 4), function(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(file,null,4));
    });

}



//-------------------------------------------------------------------------------------------------
// generateoneblock 
// Utils function
//  
//-------------------------------------------------------------------------------------------------

function generate_contract_address(nonce, sender) {

    var input_arr = [sender, nonce];
    var rlp_encoded = rlp.encode(input_arr);

    var contract_address_long = keccak('keccak256').update(rlp_encoded).digest('hex');

    var contract_address = contract_address_long.substring(24); //Trim the first 24 characters.
    //console.log("contract_address: " + contract_address);
    return contract_address;
}

//-------------------------------------------------------------------------------------------------
// sendBalance testnet or localhost
// Utils function
//  
//-------------------------------------------------------------------------------------------------

async function sendBalance_testnet(address) {

    url = "http://testnet-jsonrpc.conflux-chain.org:18082/dev/ask?address=" + address
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Has been sent to your account a CFX coin!!!")
            confluxWeb.cfx.getBalance(address).then((res) => console.log("Your address balance is :" + String(res)));

        }
    });


}


async function sendBalance_localhost(account) {
    const TO_ACCOUNT = account;

    confluxWeb.cfx.accounts.wallet.add({
        privateKey: GENESIS_PRI_KEY,
        address: GENESIS_ADDRESS
    })
    confluxWeb.cfx.getTransactionCount(GENESIS_ADDRESS).then(async(nonceValue) => {
        console.log("nonceValue:" + nonceValue)
        let gasPrice = await confluxWeb.cfx.getGasPrice();
        console.log("gasPrice : " + gasPrice)
        let txParms = {
            from: GENESIS_ADDRESS,
            nonce: nonceValue,
            gasPrice: 100,
            data: "0x00",
            value: cfxNum,
            to: TO_ACCOUNT
        };
        let gas = await confluxWeb.cfx.estimateGas(txParms);
        console.log("gas : ", gas)
        txParms.gas = gas;
        txParms.from = 0;
        confluxWeb.cfx.signTransaction(txParms)
            .then((encodedTransaction) => {
                const {
                    rawTransaction
                } = encodedTransaction;
                return confluxWeb.cfx.sendSignedTransaction(rawTransaction).then((transactionHash) => {
                    console.log('transaction hash from RPC: ', transactionHash);
                    localhost_waitBlock(transactionHash)
                })
            }).catch(console.error);
    });
}



function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
};


module.exports = {
    run
}
