import * as fs from 'fs';
import * as path from 'path';

describe('action runtime', () => {
  it('runs JavaScript actions on Node.js 24', () => {
    const actionYml = fs.readFileSync(path.join(__dirname, '..', 'action.yml'), 'utf8');

    expect(actionYml).toContain("using: 'node24'");
  });
});
