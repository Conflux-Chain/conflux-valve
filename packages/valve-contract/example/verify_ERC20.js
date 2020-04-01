/*
 * if you want to run the tests, follow the steps
 * npm init -y && npm install tape --save-dev
 * 
 * npm install  conflux-web
 *
 * npm install  tape-promise
 * 
 * npm install  tap-spec 
 *
 * npm install  nyc
 *  
 *  run :
 *      tape verify_FC_ERC20.js | tap-spec
 *
 * some help : https://github.com/substack/tape#other
 *
 *
 *
 * 
  */
const ConfluxWeb = require('conflux-web');
//const test =require('tape-promise/tape');
//var tape = require('tape')
//var _test = require('tape-promise').default // <---- notice 'default'
//var test = _test(tape)
const confluxWeb = new ConfluxWeb('http://0.0.0.0:12537');

const DEPLOYEDPRIVATEKEY = "0x91594bd85fec9695a26ed630f536195b5f8c448560f46d68512e2efcd837d0ac"; //eg: "0x2d50c1be33d59f5627cb3e80f9baea6761b411221faafa3c48808f247db6c6c5",
const DEPLOYEDADDRESS = "0xe1680683be13895b59c94eaf61818975a0d105dd"; // eg: "0xcf72957656b60f4d4144cc93206b4112508a023e" 
const fd = require("./MetaCoin_final.json");
const abi = fd.abi;
const DEPLOYEDABI = abi;// you can find in demo-test/build folder
const CONTRACTADDRESS = "0x3a69dd57facd0e1751b85182b225a3b74ae7f0e3"//"put deployed contract address"


confluxWeb.cfx.accounts.wallet.add({
    privateKey: DEPLOYEDPRIVATEKEY,
    address:DEPLOYEDADDRESS 
});
//const mc = new confluxWeb.cfx.Contract(abi).at("0x3898de0484f68e84c536298d082b6fcb12d066ca")
const myContract = new confluxWeb.cfx.Contract(DEPLOYEDABI, CONTRACTADDRESS, {
    defaultGasPrice: '10'
});


myContract.methods.getBalance("0xe1680683be13895b59c94eaf61818975a0d105dd").call().then(result => {

    console.log(result);

})

myContract.methods.getBalance("0x3ba790a9dcf7dd081f6167bc76a1e8279cb7da17").call().then(result => {

    console.log(result);

})





//returns a Promise
/*
function getAccounts(){
    return confluxWeb.cfx.getAccounts()
}

test('test get account ', function (t) {
  return getAccounts().then( (accounts) =>{
    t.equal(accounts.toString(), DEPLOYEDADDRESS, "account must be your deploy contract address")
  })
})

function name() {
  return myContract.methods.name().call()
}

test('test contract erc20 token name ', function (t) {
  return name().then( (name) =>{
    t.equal(name, "FansCoin", "name must be your deploy contract erc20 token name")
  })
})

function symbol() {
  return myContract.methods.symbol().call()
}

test('test contract erc20 token symbol ', function (t) {
  return symbol().then( (result) =>{
    t.equal(result, "FC", "name must be your deploy contract erc20 token symbol")
  })
})

function decimals() {
  return myContract.methods.decimals().call()
}

test('test contract erc20 token  decimals', function (t) {
  return decimals().then( (result) =>{
    t.equal(result, 18, "decimals must be your deploy contract set decimals")
  })
})

function cap() {
  return myContract.methods.cap().call()
}

test('test contract erc20 token  decimals', function (t) {
  return cap().then( (result) =>{
    t.equal(result._hex, '0x52b7d2dcc80cd2e4000000', " must be your deploy contract set cap")
  })
})

function circulationRatio() {
  return myContract.methods.circulationRatio().call()
}

test('test contract erc20 token  circulationRatio', function (t) {
  return circulationRatio().then( (result) =>{
    t.equal(result._hex, '0x64', " must be your deploy contract set circulationRatio")
  })
})


function isAdmin(address) {
  return myContract.methods.isAdmin(address).call()
}

test('test address is the admin role', function (t) {
  return isAdmin(DEPLOYEDADDRESS).then( (result) =>{
    t.equal(result, true, " deployer must be the admin role")
  })
})



/*
function name() {
    confluxWeb.cfx.getTransactionCount(confluxWeb.cfx.accounts.wallet[0].address).then(nonceValue => {
        const txParams = {
            from: 0,
            nonce: nonceValue, // make nonce appropriate
            gasPrice: 10,
            gas: 10000000,
            value: 0,
            to: "0x3898de0484f68e84c536298d082b6fcb12d066ca",//contract address
            data: myContract.methods.name().encodeABI(), // get data from ABI
        };
        confluxWeb.cfx.signTransaction(txParams)
            .then((encodedTransaction) => {
                const {
                    rawTransaction
                } = encodedTransaction;
                console.log('raw transaction: ', rawTransaction);
                return confluxWeb.cfx.sendSignedTransaction(rawTransaction).then((transactionHash) => {
                    console.log('transaction hash from RPC: ', transactionHash);
                });
            }).catch(console.error);
    })
}


//name();
*/
