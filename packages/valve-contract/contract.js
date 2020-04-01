var ethJSABI = require("ethjs-abi");
var BlockchainUtils = require("truffle-blockchain-utils");
const { Conflux,  provider } = require('js-conflux-sdk');

const cfx = new Conflux({
    url: 'http://0.0.0.0:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
});
var Web3 = require("conflux-web");
const newContract = require("valve-lib");
const webUtils = require("web3-utils");
//var StatusError = require("./statuserror.js")
var util = require("util");
var execute = require("./execute");
//const bootstrap = require("./bootstrap");
var contract = (function(module) {

    function Provider(provider) {
        this.provider = provider;
    };

    Provider.prototype.send = function() {
        return this.provider.send.apply(this.provider, arguments);
    };

    Provider.prototype.sendAsync = function() {
        return this.provider.sendAsync.apply(this.provider, arguments);
    };

    function Contract(contract) {
        var instance = this;
        var constructor = this.constructor;
        if (typeof contract === "string") {
            var web3Instance = new constructor.web3.cfx.Contract(constructor.abi);
            //var web3Instance = cfx.Contract({address:contract, abi: constructor.abi});
            
            //console.log("web3Instance:", web3Instance);
            web3Instance.options.address = contract;
            //web3Instance.address = contract;
            contract = web3Instance;
        }

        // Core:
        instance.methods = {};
        instance.abi = constructor.abi;
        instance.address = contract.options.address;
        instance.transactionHash = contract.transactionHash;
        instance.contract = contract;
        // User defined methods, overloaded methods, events
        instance.abi.forEach(function(item) {
            switch (item.type) {
                case "function":
                    //var isConstant = ["pure", "view"].includes(item.stateMutability) || item.constant; // new form // deprecated case
                    var isConstant = item.constant; // new form // deprecated case

                    var signature = webUtils._jsonInterfaceMethodToString(item);
                    var method = function(constant, web3Method) {
                        var fn;
                        constant
                            ?
                            (fn = execute.call.call(
                                constructor,
                                web3Method,
                                item,
                                instance.address
                            )) :
                            (fn = execute.send.call(
                                constructor,
                                web3Method,
                                item,
                                instance.address
                            ));

                        fn.call = execute.call.call(
                            constructor,
                            web3Method,
                            item,
                            instance.address
                        );
                        fn.sendTransaction = execute.send.call(
                            constructor,
                            web3Method,
                            item,
                            instance.address
                        );
                        return fn;
                    };

                    // Only define methods once. Any overloaded methods will have all their
                    // accessors available by ABI signature available on the `methods` key below.
                    if (instance[item.name] === undefined) {
                        instance[item.name] = method(
                            isConstant,
                            contract.methods[item.name]
                        );
                    }
                    // maybe wo don't need this
                    // Overloaded methods should be invoked via the .methods property
                    //instance.methods[signature] = method(
                    instance.methods[signature] = method(
                        isConstant,
                        contract.methods[signature]
                    );
                    break;

                case "event":
                    //TODO  do nothing
                    break;
            }
        });
        /*
        // sendTransaction / send
        instance.sendTransaction = execute.send.call(
            constructor,
            null,
            null,
            instance.address
        );

        // Prefer user defined `send`
        if (!instance.send) {
            instance.send = (value, txParams = {}) => {
                const packet = Object.assign({
                    value: value
                }, txParams);
                return instance.sendTransaction(packet);
            };
        }
        */
    };

    var Utils = {
        bootstrap: function(fn) { // Add our static methods
            Object.keys(fn._constructorMethods).forEach(function(key) {
                fn[key] = fn._constructorMethods[key].bind(fn);
            }); // Add our properties.

            Object.keys(fn._properties).forEach(function(key) {
                fn.addProp(key, fn._properties[key]);
            });

            return fn;
        },

        merge: function() {
            var merged = {};
            var args = Array.prototype.slice.call(arguments);


            for (var i = 0; i < args.length; i++) {
                var object = args[i];
                var keys = Object.keys(object);
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    var value = object[key];
                    merged[key] = value;
                }
            }


            return merged;
        },

    };

    Contract._constructorMethods = {

        setProvider: function(provider) {
            if (!provider) {
                throw new Error("Invalid provider passed to setProvider(); provider is " + provider);
            }


            var wrapped = new Provider(provider);
            this.web3.setProvider(wrapped);
            this.currentProvider = provider;
        },

        at: async function(address) {
            console.log('at what: ', address)
            if (
                address == null ||
                typeof address !== "string" ||
                address.length !== 42
            ) {
                throw new Error(
                    `Invalid address passed to ${this.contractName}.at(): ${address}`
                );
            }

            try {
                const onChainCode = await cfx.getCode(address);
                //console.log("onchainCode:", onChainCode);
                if (!onChainCode || onChainCode.replace("0x", "").replace(/0/g, "") === "")
                    throw new Error(
                        `Cannot create instance of ${this.contractName}; no code at address ${address}`
                    );
                return new this(address);
            } catch (error) {
                throw error;
            }
        },
        deployed: async function() {

            //add something fn to check 
            /*
            try {
                utils.checkNetworkArtifactMatch(this);
                utils.checkDeployment(this);
                return new this(this.address);
            } catch (error) {
                throw error;
            }
            */


        },
        new: function(){
        // try to new deploy, then get the new contract address,return new this(contract address); 
        // warning : this function will be deploy the build dir all the contract ,get the new contract address
        let newAddress = newContract();
        this.at(newAddress)

        },
        parallel: function(arr, callback) {
            callback = callback || function() {};
            if (!arr.length) {
                return callback(null, []);
            }
            var index = 0;
            var results = new Array(arr.length);
            arr.forEach(function(fn, position) {
                fn(function(err, result) {
                    if (err) {
                        callback(err);
                        callback = function() {};
                    } else {
                        index++;
                        results[position] = result;
                        if (index >= arr.length) {
                            callback(null, results);
                        }
                    }
                });
            });
        },

        clone: function(json) {
            json = json || {};

            const temp = function TruffleContract() {
                this.constructor = temp;
                return Contract.apply(this, arguments);
            };

            temp.prototype = Object.create(this.prototype);


            // If we have a network id passed
            if (typeof json !== "object") {
                json = this._json;
            }

            json = Utils.merge({}, this._json || {}, json);

            temp._constructorMethods = this._constructorMethods;
            temp._properties = this._properties;

            temp._property_values = {};
            temp._json = json;

            Utils.bootstrap(temp);

            temp.web3 = new Web3();
            //wo don't need to set_provider, use the instance of conflux object
            

            temp.class_defaults = temp.prototype.defaults || {};
            // Copy over custom key/values to the contract class

            Object.keys(json).forEach(key => {
                if (key.indexOf("x-") !== 0) return;
                temp[key] = json[key];
            });

            return temp;
        },

        addProp: function(key, fn) {
            const getter = () => {
                if (fn.get != null) {
                    return fn.get.call(this);
                }

                return this._property_values[key] || fn.call(this);
            };

            const setter = val => {
                if (fn.set != null) {
                    fn.set.call(this, val);
                    return;
                }

                // If there's not a setter, then the property is immutable.
                throw new Error(`${key} property is immutable`);
            };

            const definition = {};
            definition.enumerable = false;
            definition.configurable = false;
            definition.get = getter;
            definition.set = setter;

            Object.defineProperty(this, key, definition);
        },

        toJSON: function() {
            return this._json;
        },

    };
    // Getter functions are scoped to Contract object.
    Contract._properties = {
            contract_name: {
                get: function() {
                    return this.contractName;
                },
                set: function(val) {
                    this.contractName = val;
                }
            },
            contractName: {
                get: function() {
                    return this._json.contractName || "Contract";
                },
                set: function(val) {
                    this._json.contractName = val;
                }
            },
            abi: {
                get: function() {
                    return this._json.abi;
                },
                set: function(val) {
                    this._json.abi = val;
                }
            },
            address: {
                get: function() {
                    var address = this.address;


                    if (address == null) {
                        throw new Error("Cannot find deployed address: " + this.contractName + " not deployed or address not set.");
                    }


                    return address;
                },
                set: function(val) {
                    if (val == null) {
                        throw new Error("Cannot set deployed address; malformed value: " + val);
                    } // Finally, set the address.
                    this.address = val;
                }
            },
            bytecode: {
                get: function() {
                    return this._json.bytecode;
                },
                set: function(val) {
                    this._json.bytecode = val;
                }
            },
        },

        Utils.bootstrap(Contract);

    module.exports = Contract;
    return Contract;

})(module || {});
