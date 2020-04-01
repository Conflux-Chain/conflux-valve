const ConfluxWeb = require('conflux-web');
const confluxWeb = new ConfluxWeb('http://testnet-jsonrpc.conflux-chain.org:12537');

confluxWeb.cfx.accounts.wallet.add({
    privateKey: "0x2d50c1be33d59f5627cb3e80f9baea6761b411221faafa3c48808f247db6c6c5",
    address: "0xcf72957656b60f4d4144cc93206b4112508a023e"
});


confluxWeb.cfx.getAccounts().then(console.log);

const fd = require("../build/FC.sol.json");
const abi = fd.abi;
//const mc = new confluxWeb.cfx.Contract(abi).at("0x3898de0484f68e84c536298d082b6fcb12d066ca")
const myContract = new confluxWeb.cfx.Contract(abi, "0x3898de0484f68e84c536298d082b6fcb12d066ca", {
    defaultGasPrice: '10'
});

myContract.methods.name().call().then((result) => {
    console.log("contract call function contract_name result will be:" + result);
}).catch(console.error);
myContract.methods.symbol().call().then((result) => {
    console.log("contract call function contract_symbol result will be:" + result);
}).catch(console.error);
myContract.methods.decimals().call().then((result) => {
    console.log("contract call function contract_decimals result will be:" + result);
}).catch(console.error);

myContract.methods.cap().call().then((result) => {
    console.log("contract call function contract_cap result will be:" + result);
}).catch(console.error);

myContract.methods.totalSupply().call().then((result) => {
    console.log("contract call function contract_totalSupply result will be:" + result);
}).catch(console.error);


myContract.methods.balanceOf("0xcf72957656b60f4d4144cc93206b4112508a023e").call().then((result) => {
    console.log("contract call function contract_balanceOf_0xcf72957656b60f4d4144cc93206b4112508a023e result will be:" + result);
}).catch(console.error);

myContract.methods.circulationRatio().call().then((result) => {
    console.log("contract call function contract_circulationRatio result will be:" + result);
}).catch(console.error);


myContract.methods.stateOf("0xcf72957656b60f4d4144cc93206b4112508a023e").call().then((result) => {
    console.log("contract call function contract_stateOf result will be:" + result);
}).catch(console.error);

myContract.methods.accountTotal().call().then((result) => {
    console.log("contract call function contract_accountTotal result will be:" + result);
}).catch(console.error);


myContract.methods.transfer("0xad53f1473e2c90be7c0cb90f2fcded8a1cae882b", 9527).call().then((result) => {
    console.log("contract call function transfer result will be:" + result);
}).catch(console.error);


myContract.methods.balanceOf("0xad53f1473e2c90be7c0cb90f2fcded8a1cae882b").call().then((result) => {
    console.log("contract call function contract_balanceOf_0xad53f1473e2c90be7c0cb90f2fcded8a1cae882b result will be:" + result);
}).catch(console.error);


myContract.methods.isAdmin("0xcf72957656b60f4d4144cc93206b4112508a023e").call().then((result) => {
    console.log("contract call function contract_isAdmin result will be:" + result);
}).catch(console.error);




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

