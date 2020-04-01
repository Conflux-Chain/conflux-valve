const utils = require("./lib/utils");
const tmp = require("tmp");
const path = require("path");
const ora = require("ora");

const Box = {
  unbox: async (url, destination, options = {}) => {
    let tempDirCleanup;
    options.logger = options.logger || { log: () => {} };
    const unpackBoxOptions = {
      logger: options.logger,
      force: options.force
    };

    try {
      options.logger.log("");
      const tempDir = await utils.setUpTempDirectory();
      tempDirPath = tempDir.path;
      tempDirCleanup = tempDir.cleanupCallback;

      await utils.downloadBox(url, tempDirPath);

      const boxConfig = await utils.readBoxConfig(tempDirPath);

      await utils.unpackBox(
        tempDirPath,
        destination,
        boxConfig,
        unpackBoxOptions
      );

      const cleanupSpinner = ora("Cleaning up temporary files").start();
      tempDirCleanup();
      cleanupSpinner.succeed();

      await utils.setUpBox(boxConfig, destination);

      return boxConfig;
    } catch (error) {
      if (tempDirCleanup) tempDirCleanup();
      throw new Error(error);
    }
  },

  // options.unsafeCleanup
  //   Recursively removes the created temporary directory, even when it's not empty. default is false
  // options.setGracefulCleanup
  //   Cleanup temporary files even when an uncaught exception occurs
};

module.exports = Box;
