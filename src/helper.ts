// Some utils function get from Vite
import * as path from "node:path";
import * as os from "node:os";
import { createHash } from 'node:crypto'

const queryRE = /\?.*$/s;
const hashRE = /#.*$/s;

export const cleanUrl = (url: string): string =>
  url.replace(hashRE, "").replace(queryRE, "");

const isWindows = os.platform() === "win32";

const VOLUME_RE = /^[A-Z]:/i;
function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

const FS_PREFIX = "/@fs/";
function fsPathFromId(id: string): string {
  const fsPath = normalizePath(
    id.startsWith(FS_PREFIX) ? id.slice(FS_PREFIX.length) : id
  );
  return fsPath.startsWith("/") || fsPath.match(VOLUME_RE)
    ? fsPath
    : `/${fsPath}`;
}

export function fsPathFromUrl(url: string): string {
  return fsPathFromId(cleanUrl(url));
}


export function getHash(text: string) {
    return createHash('sha256').update(text).digest('hex').substring(0, 8)
}