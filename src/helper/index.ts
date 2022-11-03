import semver from "semver";

export * from "./vite";

export const indexOfAny = (s: string, charList: string) => {
  for (let i = 0; i < charList.length; i++) {
    const index = s.indexOf(charList[i]);
    if (index !== -1) return index;
  }
  return null;
};

const cleanVersion = (zigVersion: string) => {
  const extra_index = indexOfAny(zigVersion, "-+");
  const version = zigVersion.substring(0, extra_index ?? zigVersion.length);
  return version;
};

export const ensureZigVersion = (zigVersion: string, range: string) => {
  const version = cleanVersion(zigVersion);
  if (!semver.satisfies(version, range)) {
    throw new Error(
      `Require zig version ${range} but current installed version is ${version}`
    );
  }
};

export const atLeastZigVersion = (zigVersion: string, minVersion: string) => {
  const version = cleanVersion(zigVersion);
  return semver.satisfies(version, `>=${minVersion}`);
};
