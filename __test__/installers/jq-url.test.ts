import { JqInstaller } from '../../src/installers/jq';
import { getBinary } from '../../src/installers/utils';

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  arch: jest.fn(() => 'x64'),
  platform: jest.fn(() => 'linux'),
}));

jest.mock('../../src/installers/utils', () => ({
  getBinary: jest.fn().mockResolvedValue('/tmp/jq'),
}));

describe('jq download URL', () => {
  it('downloads jq from the SourceForge mirror', async () => {
    await new JqInstaller().install('1.6');

    expect(getBinary).toHaveBeenCalledWith(
      'jq',
      '1.6',
      'https://sourceforge.net/projects/stedolan-jq.mirror/files/jq-1.6/jq-linux64/download',
    );
  });
});
