const fs = require('fs/promises');

const toolDir = process.env['RUNNER_TOOL_CACHE'];
const tempDir = process.env['RUNNER_TEMP'];

module.exports = async () => {
  await fs.rm(toolDir, { force: true, recursive: true });
  await fs.rm(tempDir, { force: true, recursive: true });
};
