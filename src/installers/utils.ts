import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { OutgoingHttpHeaders } from 'http';

const downloadAttempts = 2;
export type DownloadUrl =
  | string
  | {
      headers?: OutgoingHttpHeaders;
      url: string;
    };

export async function getBinary(
  toolName: string,
  version: string,
  url: DownloadUrl | DownloadUrl[],
): Promise<string> {
  let cachedToolpath: string;
  cachedToolpath = tc.find(toolName, version);

  if (!cachedToolpath) {
    core.debug(`Downloading ${toolName} from: ${url}`);

    let downloadPath: string | null = null;
    try {
      downloadPath = (await downloadToolWithRetries(url)).downloadPath;
    } catch (error) {
      throw `Failed to download version ${version}: ${error}`;
    }

    cachedToolpath = await tc.cacheFile(
      downloadPath,
      toolName + getExecutableExtension(),
      toolName,
      version,
    );
  }

  const executablePath = path.join(
    cachedToolpath,
    toolName + getExecutableExtension(),
  );

  fs.chmodSync(executablePath, '777');

  return executablePath;
}

export async function getTarballBinary(
  toolName: string,
  version: string,
  url: DownloadUrl | DownloadUrl[],
  binaryPath: string = '',
): Promise<string> {
  let cachedToolpath: string;
  cachedToolpath = tc.find(toolName, version);

  if (!cachedToolpath) {
    core.debug(`Downloading ${toolName} from: ${url}`);

    let downloadPath: string | null = null;
    let downloadUrl: string;
    try {
      const download = await downloadToolWithRetries(url);
      downloadPath = download.downloadPath;
      downloadUrl = download.downloadUrl;
    } catch (error) {
      throw `Failed to download version ${version}: ${error}`;
    }

    let extPath: string;
    if (downloadUrl.includes('.zip')) {
      extPath = await tc.extractZip(downloadPath);
    } else {
      extPath = await tc.extractTar(downloadPath);
    }

    cachedToolpath = await tc.cacheFile(
      path.join(extPath, binaryPath, toolName + getExecutableExtension()),
      toolName + getExecutableExtension(),
      toolName,
      version,
    );
  }

  const executablePath = path.join(
    cachedToolpath,
    toolName + getExecutableExtension(),
  );

  fs.chmodSync(executablePath, '777');

  return executablePath;
}

export function getExecutableExtension(): string {
  if (os.type().match(/^Win/)) {
    return '.exe';
  }
  return '';
}

async function downloadToolWithRetries(
  urls: DownloadUrl | DownloadUrl[],
): Promise<{ downloadPath: string; downloadUrl: string }> {
  const downloadUrls = Array.isArray(urls) ? urls : [urls];
  let lastError: unknown;

  for (const source of downloadUrls) {
    const url = typeof source === 'string' ? source : source.url;
    const headers = typeof source === 'string' ? undefined : source.headers;

    for (let attempt = 1; attempt <= downloadAttempts; attempt++) {
      try {
        const downloadPath = headers
          ? await tc.downloadTool(url, undefined, undefined, headers)
          : await tc.downloadTool(url);

        return {
          downloadPath,
          downloadUrl: url,
        };
      } catch (error) {
        lastError = error;

        if (attempt < downloadAttempts) {
          core.debug(`Retrying download from ${url}`);
        }
      }
    }
  }

  throw lastError;
}
