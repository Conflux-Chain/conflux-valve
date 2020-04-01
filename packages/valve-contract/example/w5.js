var Web3PromiEvent = require('web3-core-promievent');

var myFunc = function(){
    var promiEvent = Web3PromiEvent();

    setTimeout(function() {
        promiEvent.eventEmitter.emit('done', 'Hello!');
        promiEvent.resolve('Hello!');
    }, 10);

    return promiEvent.eventEmitter;
};


// and run it
console.log(myFunc)
myFunc()
.then(console.log);
.on('done', console.log); //see the semicolon
