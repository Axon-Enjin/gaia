const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function gz(rel) {
  try {
    return zlib.gzipSync(fs.readFileSync(path.join(".next", rel))).length;
  } catch {
    return 0;
  }
}

const m = JSON.parse(fs.readFileSync(".next/build-manifest.json", "utf8"));
const shared = [...(m.rootMainFiles || []), ...(m.polyfillFiles || [])];

let total = 0;
console.log("Shared initial JS (loaded on every app route):");
for (const f of shared) {
  const kb = gz(f) / 1024;
  total += kb;
  console.log(`${kb.toFixed(1).padStart(7)} KB gz  ${f}`);
}
console.log("-----");
console.log(`shared initial JS: ${total.toFixed(1)} KB gz  (budget: 220 KB)`);
console.log(total <= 220 ? "PASS (shared baseline within budget)" : "FAIL");
