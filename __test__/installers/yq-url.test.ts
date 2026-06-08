import { getBinary } from '../../src/installers/utils';
import { YqInstaller } from '../../src/installers/yq';

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  arch: jest.fn(() => 'x64'),
  platform: jest.fn(() => 'linux'),
}));

jest.mock('../../src/installers/utils', () => ({
  getBinary: jest.fn().mockResolvedValue('/tmp/yq'),
}));

describe('yq download URL', () => {
  it('downloads yq from the SourceForge mirror', async () => {
    await new YqInstaller().install('4.53.2');

    expect(getBinary).toHaveBeenCalledWith(
      'yq',
      '4.53.2',
      'https://sourceforge.net/projects/yq-yq.mirror/files/v4.53.2/yq_linux_amd64/download',
    );
  });
});
