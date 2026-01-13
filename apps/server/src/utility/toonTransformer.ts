import fs from "fs-extra";
import path from "path";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

type Row = any[];

function normalize(value: any): string {
  if (value === null || value === undefined) return "";

  const str = String(value).trim();
  if (!str) return "";

  const cleaned = str.replace(/[%₹$,]/g, "").replace(/,/g, "");
  const num = Number(cleaned);
  if (!isNaN(num)) return num.toString();

  const date = new Date(str);
  if (!isNaN(date.getTime())) return date.toISOString();

  return str;
}

function detectTypes(rows: string[][], headers: string[]) {
  const numeric: string[] = [];
  const categorical: string[] = [];

  headers.forEach((_, i) => {
    const values = rows.map(r => r[i]).filter(Boolean);
    const numericCount = values.filter(v => !isNaN(Number(v))).length;

    if (values.length && numericCount / values.length > 0.7) {
      numeric.push(headers[i]);
    } else {
      categorical.push(headers[i]);
    }
  });

  return { numeric, categorical };
}

function aggregate(
  rows: string[][],
  headers: string[],
  groupBy: string,
  numericCols: string[]
) {
  const gIndex = headers.indexOf(groupBy);
  const nIndexes = numericCols.map(c => headers.indexOf(c));
  const result = new Map<string, number[]>();

  rows.forEach(r => {
    const key = r[gIndex];
    if (!result.has(key)) {
      result.set(key, nIndexes.map(() => 0));
    }
    const acc = result.get(key)!;
    nIndexes.forEach((i, idx) => {
      acc[idx] += Number(r[i]) || 0;
    });
  });

  return [...result.entries()].map(([k, vals]) => [
    k,
    ...vals.map(v => Math.round(v).toString())
  ]);
}

function rowsToTOON(rows: string[][]): string {
  return rows.map(r => r.join(",")).join("\n");
}

async function processCSV(file: string): Promise<string> {
  const raw = await fs.readFile(file, "utf8");
  const records = parse(raw, { skip_empty_lines: true });
  const headers = records[0];
  const body = records.slice(1).map((r: any[]) => r.map(normalize));

  const { numeric, categorical } = detectTypes(body, headers);
  const groupBy = categorical[0];

  let toon = `@dataset ${path.basename(file)}:\n`;
  toon += `rows=${body.length}\n`;
  toon += `numeric=${numeric.join(",")}\n`;
  toon += `categorical=${categorical.join(",")}\n\n`;

  toon += `@table {${headers.join(",")}}:\n`;
  toon += rowsToTOON(body) + "\n\n";

  if (groupBy && numeric.length) {
    const agg = aggregate(body, headers, groupBy, numeric);
    toon += `@aggregate groupBy=${groupBy} {${numeric.map(n => n + "_sum").join(",")}}:\n`;
    toon += rowsToTOON(agg) + "\n";
  }

  return toon;
}

export async function transformToTOON(
  files: string[],
  outputFile: string
) {
  let output = `@meta:\ngeneratedAt=${new Date().toISOString()}\n\n`;

  for (const file of files) {
    if (file.endsWith(".csv")) {
      output += await processCSV(file);
      output += "\n";
    }
    // XLSX support can plug in here with same TOON blocks
  }

  await fs.writeFile(outputFile, output.trim());
  return output;
}
