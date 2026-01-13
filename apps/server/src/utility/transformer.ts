import { transformToTOON } from "./toonTransformer.js";
import { countApproxTokens } from "./tokenCounter.js";
import fs from "node:fs/promises";
import path from "node:path";

export const transform = async () => {
  const __dirname = path.dirname(__filename);


  // Inputs
  const inputFiles = [
    path.resolve(__dirname, "../data/input.csv")
  ];

  const outputTOON = path.resolve(__dirname, "../data/output.toon");

  console.log("▶ Reading CSV files...");

  let combinedCSV = "";

  for (const file of inputFiles) {
    const content = await fs.readFile(file, "utf8");
    combinedCSV += "\n" + content;
  }

  // 1️⃣ Count CSV tokens
  const csvTokens = countApproxTokens(combinedCSV);

  // 2️⃣ Generate TOON
  const toonText = await transformToTOON(inputFiles, outputTOON);

  // 3️⃣ Count TOON tokens
  const toonTokens = countApproxTokens(toonText);

  // 4️⃣ Print comparison
  console.log("\n📊 TOKEN COMPARISON");
  console.log("────────────────────────────");
  console.log(`CSV Tokens   : ${csvTokens}`);
  console.log(`TOON Tokens  : ${toonTokens}`);
  console.log(
    `Reduction    : ${(
      ((csvTokens - toonTokens) / csvTokens) *
      100
    ).toFixed(2)}%`
  );
  console.log("────────────────────────────");
  console.log(`📁 TOON saved at: ${outputTOON}`);

}