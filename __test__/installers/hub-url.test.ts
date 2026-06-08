import { getTarballBinary } from '../../src/installers/utils';
import { HubInstaller } from '../../src/installers/hub';

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  arch: jest.fn(() => 'x64'),
  platform: jest.fn(() => 'linux'),
}));

jest.mock('../../src/installers/utils', () => ({
  getTarballBinary: jest.fn().mockResolvedValue('/tmp/hub'),
}));

describe('hub download URL', () => {
  it('downloads hub from the SourceForge mirror', async () => {
    await new HubInstaller().install('2.14.2');

    expect(getTarballBinary).toHaveBeenCalledWith(
      'hub',
      '2.14.2',
      'https://sourceforge.net/projects/hub.mirror/files/v2.14.2/hub-linux-amd64-2.14.2.tgz/download',
      'hub-linux-amd64-2.14.2/bin',
    );
  });
});
