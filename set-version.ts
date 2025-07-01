import { readFileSync, writeFileSync } from "fs";
import packageJson from "./package.json";

const currentVersion = packageJson.version;

console.log(`Current version: ${currentVersion}`);
const newVersion = prompt(`New version:`);

if (!newVersion) {
  console.error("Exiting: no version entered");
  process.exit(1);
}

for (const file of ["package.json", "public/manifest.json"]) {
  const content = readFileSync(file, "utf8");
  const updated = content.replace(
    /("version"\s*:\s*")[^"]*(")/,
    `$1${newVersion}$2`
  );
  writeFileSync(file, updated);
}
