import { it, expect } from 'vitest';
import { ensureZigVersion } from '../helper';

it("ensure zig version", () => {

    expect(() => ensureZigVersion("0.9.0", ">=0.10.0")).toThrowError();
    expect(() => ensureZigVersion("invalid", ">=0.10.0")).toThrowError();

    expect(() => ensureZigVersion("0.11.0-dev", ">=0.10.0")).not.toThrowError();
    expect(() => ensureZigVersion("0.10.0-dev.4720+9b54c9de", ">=0.10.0")).not.toThrowError();
})