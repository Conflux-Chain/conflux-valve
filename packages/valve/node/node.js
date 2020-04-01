
const ChainService = require('./ChainService');

const chain = new ChainService(); 

console.log('chain:', chain)
chain.start();



//async function node() {
//    if (chain.isServerStarted()) {
//     await chain.stopServer();
//    }
//    
//    chain.stopProcess();
//    chain.start();
//}
//
//node()
