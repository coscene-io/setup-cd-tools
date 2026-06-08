import * as core from '@actions/core';
import * as https from 'https';
import * as os from 'os';
import * as path from 'path';
import { Installer } from './installer';
import { DownloadUrl, getTarballBinary } from './utils';

const toolName = 'kustomize';
const userAgent = 'coscene-io/setup-cd-tools';

export class KustomizeInstaller implements Installer {
  async install(version: string) {
    const url = await getDownloadUrl(version);
    const kustomizePath = await getTarballBinary(toolName, version, url);

    core.debug(`kustomize has been cached at ${kustomizePath}`);

    core.addPath(path.dirname(kustomizePath));
  }
}

async function getDownloadUrl(version: string): Promise<DownloadUrl> {
  let platformMap: { [platform: string]: string } = {
    linux: 'linux',
    darwin: 'darwin',
    win32: 'windows',
  };

  let archMap: { [arch: string]: string } = {
    x64: 'amd64',
  };

  const arch = archMap[os.arch()];
  const platform = platformMap[os.platform()];

  if (!arch || !platform) {
    throw `Unsupported platform. platform:${os.platform()}, arch:${os.arch()}`;
  }

  const assetName = `kustomize_v${version}_${platform}_${arch}.tar.gz`;
  const release = await getGitHubRelease(version);
  const asset = release.assets.find(({ name }) => name === assetName);

  if (!asset) {
    throw `Could not find kustomize release asset: ${assetName}`;
  }

  return {
    headers: {
      Accept: 'application/octet-stream',
    },
    url: `https://api.github.com/repos/kubernetes-sigs/kustomize/releases/assets/${asset.id}`,
  };
}

function getGitHubRelease(
  version: string,
): Promise<{ assets: Array<{ id: number; name: string }> }> {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/kubernetes-sigs/kustomize/releases/tags/kustomize%2Fv${version}`;

    https
      .get(
        url,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': userAgent,
          },
        },
        (response) => {
          if (response.statusCode !== 200) {
            reject(
              new Error(
                `Unexpected GitHub API response: ${response.statusCode}`,
              ),
            );
            return;
          }

          let body = '';
          response.setEncoding('utf8');
          response.on('data', (chunk) => {
            body += chunk;
          });
          response.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(error);
            }
          });
        },
      )
      .on('error', reject);
  });
}
