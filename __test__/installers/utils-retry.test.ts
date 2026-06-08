import * as tc from '@actions/tool-cache';
import { getTarballBinary } from '../../src/installers/utils';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

jest.mock('@actions/tool-cache', () => ({
  cacheFile: jest.fn().mockResolvedValue('/tmp/cache'),
  downloadTool: jest.fn(),
  extractTar: jest.fn().mockResolvedValue('/tmp/extracted'),
  extractZip: jest.fn().mockResolvedValue('/tmp/extracted-zip'),
  find: jest.fn().mockReturnValue(''),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  chmodSync: jest.fn(),
}));

describe('installer download retries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tc.find as jest.Mock).mockReturnValue('');
    (tc.extractTar as jest.Mock).mockResolvedValue('/tmp/extracted');
    (tc.extractZip as jest.Mock).mockResolvedValue('/tmp/extracted-zip');
    (tc.cacheFile as jest.Mock).mockResolvedValue('/tmp/cache');
  });

  it('retries a tarball download when the first download attempt fails', async () => {
    (tc.downloadTool as jest.Mock)
      .mockRejectedValueOnce(new Error('Unexpected HTTP response: 504'))
      .mockResolvedValueOnce('/tmp/download.tgz');

    await getTarballBinary('hub', '2.14.2', 'https://example.test/hub.tgz');

    expect(tc.downloadTool).toHaveBeenCalledTimes(2);
    expect(tc.extractTar).toHaveBeenCalledWith('/tmp/download.tgz');
    expect(tc.cacheFile).toHaveBeenCalledWith(
      '/tmp/extracted/hub',
      'hub',
      'hub',
      '2.14.2',
    );
  });

  it('extracts zip downloads with the zip extractor', async () => {
    (tc.downloadTool as jest.Mock).mockResolvedValueOnce('/tmp/download.zip');

    await getTarballBinary('hub', '2.14.2', 'https://example.test/hub.zip');

    expect(tc.extractZip).toHaveBeenCalledWith('/tmp/download.zip');
    expect(tc.extractTar).not.toHaveBeenCalled();
    expect(tc.cacheFile).toHaveBeenCalledWith(
      '/tmp/extracted-zip/hub',
      'hub',
      'hub',
      '2.14.2',
    );
  });
});
