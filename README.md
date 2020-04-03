Table of Contents
=================

   * [valve](#valve)
      * [Installing](#installing)
      * [Documentation](#documentation)
         * [start a  local node](#start-a--local-node)
         * [use docker-compose](#use-docker-compose)
         * [valve commander:](#valve-use)
            * [Step1. valve init](#step1-valve-init)
            * [Step2. valve account](#step2-valve-account)
            * [Step3. valve compile](#step3-valve-compile)
            * [Step4. valve sendbalance](#step4-valve-sendbalance)
            * [Step5. valve  deploy](#step5-valve--deploy)
            * [Step6. valve  console](#step6-valve--console)
      * [Interacting with your contract](#interacting-with-your-contract)
         * [Use a contract at a specific address](#use-a-contract-at-a-specific-address)
# valve

![Build Status](https://api.travis-ci.org/liuis/conflux-dapp-js.svg?branch=refactor) [![npm](https://img.shields.io/npm/dm/valve.svg)](https://www.npmjs.com/package/conflux-valve) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![npm version](https://badge.fury.io/js/conflux-valve.svg)](https://badge.fury.io/js/conflux-valve)

[![Docker Pulls](https://img.shields.io/docker/pulls/liqiazero/conflux-chain.svg)](https://hub.docker.com/r/liqiazero/conflux-chain/)
[![Docker Stars](https://img.shields.io/docker/stars/liqiazero/conflux-chain.svg)](https://hub.docker.com/r/liqiazero/conflux-chain/)



**valve** is an conflux framework which helps with Initialize a dapp project.  inspird by truffle && ganache! 

The framework makes the development of smart contracts in the conflux network pretty easy. It provides commands for    compilation, deployment of smart contracts, running a local node, local compiler and unit testing the contracts.

valve consists of 5 separated packages. There are two main packages.
- **valve** - This package is responsible for reading **Valve** commands from the command line
- **valve-contract** - installing this package will give you access to the Deployer, which gives you the ability to deploy    compiled contracts.
- **valve-logger** - Using this package will give you the ability to print your historical deployments on the console.   
- **valve-config** - This package is used as helper where all the necessary configuration files are included.
- **valve-utils** - Similarly to config this package helps with functions like **ReadFile**  & **keyToHex**, etc.



## Installing

```javascript
npm i -g conflux-valve
```
-----------------

## Documentation

### start a  local node
Before you start you must locally run a our conflux chain node.

If you want to build by yourself, just fellow this:
[Conflux-Docker Repo](https://github.com/Conflux-Chain/conflux-docker)

```bash
docker pull liqiazero/conflux-chain:v0.2.4


docker run --name conflux-chain  -p 12537:12537 -p 32323:32323 -p 32323:32323/udp -p 14629:14629 -p 12539:12539  -d liqiazero/conflux-chain:v0.2.4


```
***if u want use docker-compose, just following:***

-----------------

### use docker-compose

To start the network:

```bash
docker-compose up -d
```

To destroy the network:

```bash
docker-compose down
```

To cleanup the associated docker volumes, `-v` option could be used:

```bash
docker-compose down -v
```

### valve commander:

#### Step1. valve init

```javascript
valve init
```

Put your own contract under the current directory

#### Step2. valve account

```javascript
valve account
```
Generate account and private key . 


You can find the generated **wallet.json** file in the current directory. All address, privatekey, publishkey will be written to this file.

The following content :

```javascript
{
  "wallet": [
    {
      "time": "2019-12-13 11:49:43",
      "mnemonic": "accuse erosion version giant surprise hour course devote frozen cabbage birth fog",
      "accounts": [
        {
          "address": "0xa7b4e98db3d570bd6cf01141dfc69a58b0eba3d7",
          "publicKey": "0x3f2b115a74c0cecf197b8608d71890f3801c3ddc54bb5e50c2c83be9169b5c0224a70f5381a8c3ae2ea8065c476498c774b39f4093ecd6b687912d5ebd83452e",
          "privateKey": "0x4270f5706de09280ff78cc91d3e02ce7a209538ce4fcf9b21d55196d5c89ac01"
        },
        {
          "address": "0xd886f98626094a77d831a91ed15e2b0e2d463416",
          "publicKey": "0xa3029052cd227709e2cdaefec0088a0248f00934bfe70022ec24c8b7f6bdd8c9de85b16a21632b536ca22f917eb3798c5b20644720667cd9bffe3fd7c12a5ec1",
          "privateKey": "0xe5a0ddb5bae3cd7649981a5735c4eef3680969aa9e1852e0946e5313117f29d4"
        },
        .....................................
      ]
    }
  ]
}

```
#### Step3. valve compile 

```javascript
example:
      valve compile 
```

if you have multiple contracts, libraries, etc., there is a reference relationship between them. When compiling, valve will automatically do the linking for you. But you need to deploy your contracts in the order suggested.

````javascript 
.........
.........
--------------------------------------------                                                  │
output: { contracts:                                                                          │
   { 'ConvertLib.sol': { ConvertLib: [Object] },                                              │
     'MetaCoin.sol': { MetaCoin: [Object] },                                                  │
     'Migrations.sol': { Migrations: [Object] } },                                            │
  sources:                                                                                    │
   { 'ConvertLib.sol': { id: 0 },                                                             │
     'MetaCoin.sol': { id: 1 },                                                               │
     'Migrations.sol': { id: 2 } } }

U need first deploy this contract: [ 'ConvertLib.sol', 'Migrations.sol' ]


then deploy this contract: [ 'MetaCoin.sol' ]


````

To compile your contract, will generate build directory down generated abi and the bytecode.

#### Step4. valve sendbalance 

Give your address some CFX coin.

```javascript
example:
        valve sendbalance --a "0xe1680683be13895b59c94eaf61818975a0d105dd"
```

#### Step5. valve  deploy 


Select the address and privatekey you want to deploy in the wallet.json file.

Ensure that your account has plenty of cfx coin, if not you can use **valve sendbalance**  send some to your account.

```javascript
example： 
valve deploy --a "0xe1680683be13895b59c94eaf61818975a0d105dd"  --pk "0x91594bd85fec9695a26ed630f536195b5f8c448560f46d68512e2efcd837d0ac" --name ConvertLib
        
```

Will be sent to test network related contracts over the contract.

If you are successful, you will receive the following log:

```javascript
example:

..............

Your contract has been deployed at :0xae2b17be6f7d590510fa7db89f86c02f55e73d2a

````
#### Step6. valve  console

```javascript
 Home> valve console                                                                                                   
```
```javascript
valve(localhost_docker)> cfx.
cfx.__defineGetter__                   cfx.__defineSetter__                   cfx.__lookupGetter__                   cfx.__lookupSetter__
cfx.__proto__                          cfx.hasOwnProperty                     cfx.isPrototypeOf                      cfx.propertyIsEnumerable
cfx.toLocaleString                     cfx.toString                           cfx.valueOf

cfx.Account                            cfx.Contract                           cfx.call                               cfx.close
cfx.constructor                        cfx.estimateGas                        cfx.getBalance                         cfx.getBestBlockHash
cfx.getBlockByEpochNumber              cfx.getBlockByHash                     cfx.getBlockByHashWithPivotAssumption  cfx.getBlocksByEpochNumber
cfx.getCode                            cfx.getEpochNumber                     cfx.getGasPrice                        cfx.getRiskCoefficient
cfx.getTransactionByHash               cfx.getTransactionCount                cfx.getTransactionReceipt              cfx.setProvider

cfx.defaultEpoch                       cfx.defaultGas                         cfx.defaultGasPrice                    cfx.getLogs
cfx.provider                           cfx.sendRawTransaction                 cfx.sendTransaction

```

```javascript
valve(localhost_docker)> cfx.defaultEpoch
'latest_state'
valve(localhost_docker)> cfx.defaultGas
1000000
valve(localhost_docker)> cfx.defaultGasPrice
100

valve(localhost_docker)> (await cfx.getBalance("0xe1680683be13895b59c94eaf61818975a0d105dd")).toString()
'199937499999800000000'
```



## Interacting with your contract

contract:  MetaCoin.sol

````javascript

pragma solidity >=0.4.25 <0.6.0;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract MetaCoin {
    mapping (address => uint) balances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() public {
        balances[tx.origin] = 10000;
    }

    function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
        if (balances[msg.sender] < amount) return false;
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Transfer(msg.sender, receiver, amount);
        return true;
    }

    function getBalanceInEth(address addr) public view returns(uint){
        return ConvertLib.convert(getBalance(addr),2);
    }

    function getBalance(address addr) public view returns(uint) {
        return balances[addr];
    }
}

````
### Use a contract at a specific address

```javascript
valve(localhost_docker)> MetaCoin.
MetaCoin.__defineGetter__      MetaCoin.__defineSetter__      MetaCoin.__lookupGetter__      MetaCoin.__lookupSetter__      MetaCoin.__proto__
MetaCoin.hasOwnProperty        MetaCoin.isPrototypeOf         MetaCoin.propertyIsEnumerable  MetaCoin.toLocaleString        MetaCoin.valueOf

MetaCoin.apply                 MetaCoin.bind                  MetaCoin.call                  MetaCoin.constructor           MetaCoin.toString

MetaCoin._constructorMethods   MetaCoin._json                 MetaCoin._properties           MetaCoin._property_values      MetaCoin.abi
MetaCoin.addProp               MetaCoin.address               MetaCoin.arguments             MetaCoin.at                    MetaCoin.bytecode
MetaCoin.caller                MetaCoin.class_defaults        MetaCoin.clone                 MetaCoin.contractName          MetaCoin.contract_name
MetaCoin.currentProvider       MetaCoin.deployed              MetaCoin.ens                   MetaCoin.length                MetaCoin.name
MetaCoin.new                   MetaCoin.parallel              MetaCoin.prototype             MetaCoin.setProvider           MetaCoin.toJSON
MetaCoin.web3

```
#### myContract.at('0x1234....')

```javascript
valve(localhost_docker)> coin = await MetaCoin.at("0xe4daa3e81a8c7c67d868fe21d0070ba29d61e5c9")
at what:  0xe4daa3e81a8c7c67d868fe21d0070ba29d61e5c9
undefined
valve(localhost_docker)> coin.getBalance("0xe1680683be13895b59c94eaf61818975a0d105dd")
'9988'
valve(localhost_docker)>
```



In the test directory, you can use/write javascript to test your contract.

````shell
cd test
node mc.js / mc_new.js
````



If you already have an address for a contract, you can create a new abstraction to represent the contract at that address.

````javascript 

MetaCoin.at("0x1234...").then(async function(instance) {
    coin = instance;
    ..........
    )}
    
````

example:

````javascript
const ConfluxWeb = require('conflux-web');
var provider = new ConfluxWeb.providers.HttpProvider("http://0.0.0.0:12537");
var contractTr = require('valve-contract');
var MC = require("../build/MetaCoin.sol.json");  //Enter the actual path of the file compiled by your contract
const util = require('util');

const ad = "0xe1680683be13895b59c94eaf61818975a0d105dd";
const pk = "0x91594bd85fec9695a26ed630f536195b5f8c448560f46d68512e2efcd837d0ac";

var MetaCoin = contractTr({
    contractName: "MetaCoin",
    abi: MC.abi,
    bytecode: MC.bytecode,
    address: MC.contractAddress, // optional
});

MetaCoin.setProvider(provider);

var account_one = "0xe1680683be13895b59c94eaf61818975a0d105dd";
var account_two = "0x3ba790a9dcf7dd081f6167bc76a1e8279cb7da17";
var account_three = "0x49a583998b1921eded4f2ade09255648db7672d3";

// must be add this code,when you test you contract code
if (typeof MetaCoin.currentProvider.sendAsync !== "function") {
    MetaCoin.currentProvider.sendAsync = function() {
        return MetaCoin.currentProvider.send.apply(
            MetaCoin.currentProvider,
            arguments
        );
    };
}


var contract_address = MC.contractAddress;
var coin;

//coin.constructor.web3.cfx.accounts.wallet.add({
//    privateKey: pk,
//    address: ad
//});
MetaCoin.at(contract_address).then(async function(instance) {
    coin = instance;

    //console.log(util.inspect(coin, {
    //    showHidden: true,
    //    depth: 7
    //}));
    debugger
    coin.getBalance("0xe1680683be13895b59c94eaf61818975a0d105dd").then(function(result) {

        console.log("account_one balance is :", result)
        console.log("--------------------------------")
        coin.sendCoin(account_two, 3, {form: 0xe1680683be13895b59c94eaf61818975a0d105dd, pk: "0x91594bd85fec9695a26ed630f536195b5f8c448560f46d68512e2efcd837d0ac"}).then(async function(res) {
                console.log("send account_two 3 coins result:", res) //0 is success, 1 or 2 is something is wrong
                coin.getBalance(account_two).then(function(re) {
                    console.log("account_two balance is : ", re)
                });
            })
    });
})


````
#### myContract.new('....')

This function returns a Promise that resolves into a new instance of the contract abstraction at the newly deployed address.

you can find the example in the test directory.
````javascript

......................

MetaCoin.new(....).then(async function(instance) {
    coin = instance;
    coin.getBalance("0xe1680683be13895b59c94eaf61818975a0d105dd").then(function(result) {

        console.log("account_one balance is :", result)
        console.log("--------------------------------")
        coin.sendCoin(account_two, 3, {form: 0xe1680683be13895b59c94eaf61818975a0d105dd, pk: "0x91594bd85fec9695a26ed630f536195b5f8c448560f46d68512e2efcd837d0ac"}).then(async function(res) {
                console.log("send account_two 3 coins result:", res) //0 is success, 1 or 2 is something is wrong
                coin.getBalance(account_two).then(function(re) {
                    console.log("account_two balance is : ", re)
                });
            })
    });
})

......................

 ````

