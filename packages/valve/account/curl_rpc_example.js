//curl -X POST -H "Content-Type: application/json" http://127.0.0.1:19629/ --data-binary '{"jsonrpc":"2.0","method":"generateoneblock","params":[1,3000000],"id":1}'
//{"jsonrpc":"2.0","result":"0x483666c428f78ded6abc314a32b35cf97cdb0c1fce12dec80e7c23fbdf9af907","id":1}
//
//
//
var jayson = require('jayson');
var client = jayson.client.http('http://localhost:19629');
console.time("sort");
client.request('generateoneblock', [1, 300000], function(err, error, result) {
    if(err) throw(err) 
    console.log("generateoneblock : " + result);
});
console.timeEnd("sort");
