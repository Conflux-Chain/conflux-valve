// use the keystore to manage the account & recover
var keythereum = require("keythereum");
var pbkdf2 = keythereum.crypto.pbkdf2;
var pbkdf2Sync = keythereum.crypto.pbkdf2Sync;

// geth.debug = true;

function createEthereumKey(passphrase) {
  var dk = keythereum.create();
  console.log("dk:", dk.privateKey.toString('hex'));
  var key = keythereum.dump(passphrase, dk.privateKey, dk.salt, dk.iv);
  //return JSON.stringify(key, null, 4);
  return key;
}

keythereum.exportToFile(createEthereumKey("conflux"));
//console.log(createEthereumKey("conflux"))

/*
keythereum.constants.quiet = true;

// Note: if options is unspecified, the values in keythereum.constants are used.
var options = {
  kdf: "pbkdf2",
  cipher: "aes-128-ctr",
  kdfparams: {
    c: 262144,
    dklen: 32,
    prf: "hmac-sha256"
  }
};

// synchronous
var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);

// keyObject:
{
  address: "008aeeda4d805471df9b2a5b0f38a0c3bcba786b",
  Crypto: {
    cipher: "aes-128-ctr",
    ciphertext: "5318b4d5bcd28de64ee5559e671353e16f075ecae9f99c7a79a38af5f869aa46",
    cipherparams: {
      iv: "6087dab2f9fdbbfaddc31a909735c1e6"
    },
    mac: "517ead924a9d0dc3124507e3393d175ce3ff7c1e96529c6c555ce9e51205e9b2",
    kdf: "pbkdf2",
    kdfparams: {
      c: 262144,
      dklen: 32,
      prf: "hmac-sha256",
      salt: "ae3cd4e7013836a3df6bd7241b12db061dbe2c6785853cce422d148a624ce0bd"
    }
  },
  id: "e13b209c-3b2f-4327-bab0-3bef2e51630d",
  version: 3
}

// asynchronous
keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options, function (keyObject) {
  // do stuff!
});



//
//
// key import 
//
//
//

// Specify a data directory (optional; defaults to ~/.ethereum)
var datadir = ".ethereum-test";

// Synchronous
var keyObject = keythereum.importFromFile(address, datadir);

// Asynchronous
keythereum.importFromFile(address, datadir, function (keyObject) {
  // do stuff
});

*/
