#!/usr/bin/env node

'use strict'

require = require('esm')(module /*, options */) // use to handle es6 import/export
const packageJson = require('./package.json')


const program = require('commander')
const commands = require('./commands')

const setupVersion = () => {
  program.version(packageJson.version)
}

const setupDefaultHandler = () => {
  program.on('command:*', () => {
    program.help();
  })
}

const setupCommands = () => {
  commands.initCommands(program);
}

const parseParams = () => {
  program.parse(process.argv)
}

const presentHelpIfNeeded = () => {
  if (!program.args.length) program.help();
}

const run = () => {
  setupVersion();
  setupDefaultHandler();
  setupCommands();
  parseParams();
  presentHelpIfNeeded();
}

run();
