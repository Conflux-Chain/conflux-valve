/*
 *  link code for example 
 * 
 * 
 * 
 * 
 * 
 * 
 *
var linker = require('solc/linker');
var mc = require('./build/MetaCoin.sol.json');
var keccak256 = require('js-sha3').keccak256;

function libraryHashPlaceholder (input) {
  console.log('$' + keccak256(input).slice(0, 34) + '$');
}
 
bytecode = linker.linkBytecode(mc.bytecode, { 'ConvertLib.sol:ConvertLib': '0xe4daa3e81a8c7c67d868fe21d0070ba29d61e5c9' });

console.log(mc.bytecode);
console.log(bytecode);
libraryHashPlaceholder('ConvertLib.sol:ConvertLib')
*/
