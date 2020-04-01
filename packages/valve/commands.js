const compile = require('./compile/compile.js');

const init = require('./init/init.js');

const sendbalance = require('./sendbalance/sendbalance.js');

const account = require('./account/account.js');

//const node = require('./node/node.js');

const deploy = require('./deploy/deploy.js');

const console = require('./console/index.js');

const addInitOption = (program) => {
    program
        .command('init')
        .description('Initialize valve')
        .option('--update [update]', 'Update project files')
        .action(async (option) => {
            await init.run(option.update);
        });
};

const addSendBalanceOption = (program) => {
    program
        .command('sendbalance')
        .description('give some cfx coin')
        .option('--a [account address]', 'Configure your address')
        .action(async (option) => {
            await sendbalance.run(option.a);
        });
};


const addConsoleOption = (program) => {
    program
        .command('console')
        .description('conflux RELP valve console')
        .option('--c [color]', 'Configure your color')
        .action(async (option) => {
            await console.run(option.c);
        });
};


const addAccountOption = (program) => {
    program
        .command('account')
        .description('Get the privateKey, Address, mnemonic')
        .option('--account', 'Generator 10 PrivateKey&&Address')
        .action(async (option) => {
            await account.run(option.account);
        })
}


const addCompileOption = (program) => {
    program
        .command('compile')
        .option('--name [contract name], Give you want to compile the contract name')
        .description('Compile contracts')
        .action(async (option) => {
            await compile.run(option.name);
        })
}

const addTestOption = (program) => {
    program
        .command('test')
        .description('Running the tests')
        .option('--path [tests path]', 'Path to test files', './test')
        .action(async (options) => {
            await testConfig.run(options.path);
        })
}

const addNodeOption = (program) => {
    program
        .command('node')
        .description('Running a local node. Without any argument node will be runned with --start argument')
        .option('--stop', 'Stop the node')
        .option('--start', 'Start the node')
        .option('--only', 'Start only the node without local compiler')
        .action(async (options) => {
            await node.run(options);
        })
}

const addDeployOption = (program) => {
    program
        .command('deploy')
        .description('Run deploy script')
        .option('--a [account address]', 'Configure your address')
        .option('--pk [privateKey]', 'Configure your privateKey')
        .option('--name [ContractFile]', 'Configure your ContractSolFile')
        .action(async (options) => {
            await deploy.run(options.a, options.pk, options.name);
        })
};


const initCommands = (program) => {
    addInitOption(program);
    addCompileOption(program);
    addAccountOption(program);
    addDeployOption(program);
    addSendBalanceOption(program);
    addConsoleOption(program);
}

module.exports = {
    initCommands
}
