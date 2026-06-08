const fs = require('fs/promises');
const path = require('path');

module.exports = async () => {
  const toolDir = path.join(__dirname, 'runner', 'tools');
  const tempDir = path.join(__dirname, 'runner', 'temp');

  process.env['RUNNER_TOOL_CACHE'] = toolDir;
  process.env['RUNNER_TEMP'] = tempDir;

  await fs.rm(toolDir, { force: true, recursive: true });
  await fs.rm(tempDir, { force: true, recursive: true });
};
