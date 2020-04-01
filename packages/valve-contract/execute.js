var jayson = require('jayson');
const PromiEvent = require("./promievent");
const EventEmitter = require("events");
const { Conflux, util} = require('js-conflux-sdk');
const cfx = new Conflux({
    url: 'http://0.0.0.0:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
  });
//const util = require('util');
var client = jayson.client.http('http://localhost:12537');
const execute = {
    is_tx_params: function(val) {

        const allowed_fields = {
            from: true,
            to: true,
            gas: true,
            gasPrice: true,
            value: true,
            data: true,
            nonce: true
        };

        for (let field_name of Object.keys(val)) {
            if (allowed_fields[field_name]) return true;
        }

        return false;
    },

    getTxParams: async function(methodABI, args) {
        //console.log("getTxParams, args:", args);
        const constructor = this;
        const web3 = constructor.web3;
        const expected_arg_count = methodABI ? methodABI.inputs.length : 0;

        let tx_params = {};
        const last_arg = args[args.length - 1];
        //delete  { from: "0x......." }
        if (
            args.length === expected_arg_count + 1 &&
            execute.is_tx_params(last_arg)
        ) {
            tx_params = args.pop();
        }

        return tx_params;
    },

    prepareCall: async function(constructor, methodABI, _arguments) {

        let args = Array.prototype.slice.call(_arguments);
        let params = execute.getTxParams.call(constructor, methodABI, args);
        return {
            args,
            params
        }
    },

    //getNonce: async function(web3) {
    //    //const ad = web3.cfx.accounts.wallet[0].address;
    //    const nonceValue = await web3.cfx.getTransactionCount(ad);

    //    return nonceValue;
    //},

    wait_local_block: async function(constructor, txHash, promiEvent) {
        //const web3 = constructor.web3;
        for (var i = 0, len = 5; i < len; i++) {
            client.request('generateoneblock', [100, 300000], function(err, res) {
                //console.log("pacakgeing:::::", res)
                if (err) throw err; //console.log("generateoneblock : " + result);

            });

        }
        client.request('cfx_getTransactionReceipt', [txHash], function(err, res) {
            //console.log("Note that it might take some sceonds for the block to propagate befor it's visible in conflux"
            //console.log("getTransactionReceipt:::::::", res);
            if (res.result !== null) { 
                //console.log("receipt:", receipt.stateRoot);
                return promiEvent.resolve(res.result.outcomeStatus);
            } else {
                return execute.wait_local_block(constructor, txHash, promiEvent)
            }
        })
    },

    signTransaction: async function(constructor, txParams,promiEvent) {
        const web3 = constructor.web3;

        txParams.then(async function(res) {
            //console.log("txParams gas::::::::::", res.pk);
            //pk = "0x91594bd85fec9695a26ed630f536195b5f8c448560f46d68512e2efcd837d0ac";
            const account = cfx.Account(res.pk);
            let NonceValue = await cfx.getTransactionCount(account.address);
            let gasPrice = (await cfx.getGasPrice()).toString();
            //value = util.unit.fromCFXToDrip(0).toString();
            //console.log("txParams NonceValue::::::::::", NonceValue);
            var txArg = {
                from: account.address,
                gasPrice: 100,
                gas: 1000000,
                to: txParams.to,
                value: '0',
                data: txParams.data,
                nonce: NonceValue
            };
            const rawTransaction = account.signTransaction(txArg);
            //console.log('raw transaction: ', rawTransaction);
            client.request('cfx_sendRawTransaction', [rawTransaction.serialize()], function(err, res) {
                if (err) throw err;
                //console.log('transaction hash from RPC:', res.result);
                execute.wait_local_block(constructor, res.result, promiEvent);

            });


        });
    },


    call: function(fn, methodABI, address) {
        const constructor = this;
        
        return  function() {
            const promiEvent = PromiEvent();
            const args = Array.prototype.slice.call(arguments);

            execute
                .prepareCall(constructor, methodABI, args)
                .then(async({
                    args,
                    params
                }) => {
                    //var result;
                    params.to = address;
                    promiEvent.eventEmitter.emit("execute:call:method", {
                        fn: fn,
                        args: args,
                        address: address,
                        abi: methodABI,
                        contract: constructor
                    });
                    result = await fn(...args).call(params);
                    
                    return promiEvent.resolve(result);

                })
                .catch(promiEvent.reject);

             return promiEvent.eventEmitter;
        };
    },

    send: function(fn, methodABI, address) {
        const constructor = this;
        const web3 = constructor.web3;
        return function() {
            const promiEvent = PromiEvent();
            execute
                .prepareCall(constructor, methodABI, arguments)
                .then(async({
                    args,
                    params
                }) => {
                    params.to = address;
                    params.data = fn ? fn(...args).encodeABI() : params.data;

                    promiEvent.eventEmitter.emit("execute:send:method", {
                        fn,
                        args,
                        address,
                        abi: methodABI,
                        contract: constructor
                    });

                    //console.log(util.inspect(fn, {
                    //    showHidden: false,
                    //    depth: null
                    //}));
                    //console.log("execute  send:", params);
                    await execute.signTransaction(constructor, params, promiEvent);


                })
                .catch(promiEvent.reject);

            return promiEvent.eventEmitter;
        };
    },

};



module.exports = execute;
