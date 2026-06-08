import { SkaffoldInstaller } from '../../src/installers/skaffold';
import { getBinary } from '../../src/installers/utils';

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  arch: jest.fn(() => 'x64'),
  platform: jest.fn(() => 'linux'),
}));

jest.mock('../../src/installers/utils', () => ({
  getBinary: jest.fn().mockResolvedValue('/tmp/skaffold'),
}));

describe('skaffold download URL', () => {
  it('downloads skaffold from the official GCS release bucket', async () => {
    await new SkaffoldInstaller().install('2.3.1');

    expect(getBinary).toHaveBeenCalledWith(
      'skaffold',
      '2.3.1',
      'https://storage.googleapis.com/skaffold/releases/v2.3.1/skaffold-linux-amd64',
    );
  });
});
