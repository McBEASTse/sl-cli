import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { AllSites, CacheStructure } from "./api/slapi-types.js";

const cachePath = path.join(os.tmpdir(), "sl_cli_allSites_cache.json");
const cacheTTL = 24 * 60 * 60 * 1000;

export async function readCache(): Promise<AllSites | null> {
  try {
    const fileContent = await fs.readFile(cachePath, "utf-8");
    const cache: CacheStructure = JSON.parse(fileContent);

    const isExpired = Date.now() - cache.timestamp > cacheTTL;
    if (!isExpired) {
      return cache.data;
    }
  } catch {}
  return null;
}

export async function writeCache(data: AllSites): Promise<void> {
  try {
    const cacheToSave: CacheStructure = {
      timestamp: Date.now(),
      data,
    };
    await fs.writeFile(cachePath, JSON.stringify(cacheToSave), "utf-8");
  } catch (e) {
    throw new Error(`Error writing cache file: ${(e as Error).message}`);
  }
}
