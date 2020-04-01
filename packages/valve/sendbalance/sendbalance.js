const { Conflux, util } = require('js-conflux-sdk');
const BN = require('bn.js');
const cfx = new Conflux({
    url: 'http://0.0.0.0:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
  });

async function run(address) {
    try {
        await sendcfx(address);

    } catch (e) {
        console.error(e);
    }
}

const GENESIS_PRI_KEY = "0x46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f";
const GENESIS_ADDRESS = "0xfbe45681ac6c53d5a40475f7526bac1fe7590fb8";


var jayson = require('jayson');
var client = jayson.client.http('http://localhost:12537');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function sendcfx(address) {

    //await confluxWeb.cfx.accounts.wallet.add({
    //    privateKey: GENESIS_PRI_KEY,
    //    address: GENESIS_ADDRESS
    //})
    const account = cfx.Account(GENESIS_PRI_KEY);
    const TO_ACCOUNT = address;
    return cfx.getTransactionCount(account.address).then(async(nonceValue) => {
        let gasPrice = (await cfx.getGasPrice()).toString();
        value = util.unit.fromCFXToDrip(100).toString();
        let txParms = {
            nonce: nonceValue,
            gasPrice: 100,
            gas: 1000000,
            value: value, 
            to: address,
        };
        const tx = account.signTransaction(txParms); 
        const txHash = await cfx.sendRawTransaction(tx.serialize());
        //console.log("txHash:", txHash);
        await waitBlock(txHash, address);
        //cfx.sendRawTransaction(tx.serialize())
        //    .then(async(transactionHash) => {
        //    console.log("transactionHash:", transactionHash);
        //    await waitBlock(transactionHash, address)
        //}).catch(err => console.log);
        //await confluxWeb.cfx.signTransaction(txParms)
        //    .then(async(encodedTransaction) => {
        //        const {
        //            rawTransaction
        //        } = encodedTransaction;
        //        await confluxWeb.cfx.sendSignedTransaction(rawTransaction).then(async(transactionHash) => {
        //            await waitBlock(transactionHash, TO_ACCOUNT)
        //        })
        //    }).catch(console.error);
    });
}

function package() {
    array = [];
    for (var i = 0, len = 5; i < len; i++) {
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

async function waitBlock(txHash, TO_ACCOUNT) {

    //console.log("current block:", await cfx.getEpochNumber());
    //console.time('generateoneblock');
    await package();
    //console.log("current block2:", await cfx.getEpochNumber());
    //console.timeEnd('generateoneblock');
    await cfx.getTransactionReceipt(txHash).then(
        async(receipt) => {
            //console.log("receipt:", receipt);
            if (receipt !== null) {
                console.log("Your account has been receiver some cfx coin:", TO_ACCOUNT,  (await cfx.getBalance(TO_ACCOUNT)).toString());
                //await confluxWeb.cfx.accounts.wallet.remove(GENESIS_ADDRESS)
                return Promise.resolve("done");
            } else {
                //return waitBlock(txHash, TO_ACCOUNT)
                return Promise.reject("generateBlock err, 15 blocks");
            }
        })
}

module.exports = {
    run,
    sendcfx
}
