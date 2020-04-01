const rlp = require('rlp');
const keccak = require('keccak');

var f = {
    generate_contract_address: function(nonce, sender) {
        //var nonce = 0x00; //The nonce must be a hex literal!
        //var sender = '0x6ac7ea33f8831ea9dcc53393aaa88b25a785dbf0'; //Requires a hex string as input!
        var input_arr = [sender, nonce];
        var rlp_encoded = rlp.encode(input_arr);

        var contract_address_long = keccak('keccak256').update(rlp_encoded).digest('hex');

        var contract_address = contract_address_long.substring(24); //Trim the first 24 characters.
        console.log("contract_address: " + contract_address);
        return contract_address;
    }
}


module.exports = f;
