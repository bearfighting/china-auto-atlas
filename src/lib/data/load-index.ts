import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { ContentIndex, DataIndex } from "./types";

function readJson<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), "build", fileName);
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export const loadDataIndex = cache(() => readJson<DataIndex>("data-index.json"));
export const loadContentIndex = cache(() => readJson<ContentIndex>("content-index.json"));
