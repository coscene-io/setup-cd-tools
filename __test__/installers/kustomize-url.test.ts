import { getTarballBinary } from '../../src/installers/utils';
import { KustomizeInstaller } from '../../src/installers/kustomize';
import * as https from 'https';

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  arch: jest.fn(() => 'x64'),
  platform: jest.fn(() => 'linux'),
}));

jest.mock('../../src/installers/utils', () => ({
  getTarballBinary: jest.fn().mockResolvedValue('/tmp/kustomize'),
}));

jest.mock('https', () => ({
  get: jest.fn(),
}));

describe('kustomize download URL', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (https.get as jest.Mock).mockImplementation((url, options, callback) => {
      let response: any;
      response = {
        on: jest.fn((event: string, handler: (data?: string) => void) => {
          if (event === 'data') {
            handler(
              JSON.stringify({
                assets: [
                  {
                    id: 17272155,
                    name: 'kustomize_v3.5.4_linux_amd64.tar.gz',
                  },
                ],
              }),
            );
          }

          if (event === 'end') {
            handler();
          }

          return response;
        }),
        setEncoding: jest.fn(),
        statusCode: 200,
      };

      callback(response);

      return { on: jest.fn() };
    });
  });

  it('downloads kustomize from the official GitHub release asset API', async () => {
    await new KustomizeInstaller().install('3.5.4');

    expect(https.get).toHaveBeenCalledWith(
      'https://api.github.com/repos/kubernetes-sigs/kustomize/releases/tags/kustomize%2Fv3.5.4',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'coscene-io/setup-cd-tools',
        },
      },
      expect.any(Function),
    );
    expect(getTarballBinary).toHaveBeenCalledWith('kustomize', '3.5.4', {
      headers: {
        Accept: 'application/octet-stream',
      },
      url: 'https://api.github.com/repos/kubernetes-sigs/kustomize/releases/assets/17272155',
    });
  });
});
