export function countApproxTokens(text: string): number {
  return text
    .replace(/[^\w\s]/g, " ")   // remove punctuation
    .split(/\s+/)               // split by whitespace
    .filter(Boolean)
    .length;
}
