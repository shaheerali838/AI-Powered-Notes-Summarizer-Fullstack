import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate a folder structure tree
function printTree(
  dir,
  prefix = "",
  ignore = ["node_modules", "dist", "build"]
) {
  const files = fs.readdirSync(dir).filter((file) => !ignore.includes(file));
  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const isLast = index === files.length - 1;
    console.log(`${prefix}${isLast ? "└──" : "├──"} ${file}`);
    if (stats.isDirectory()) {
      printTree(filePath, `${prefix}${isLast ? "    " : "│   "}`, ignore);
    }
  });
}

// Start from the src directory
const rootDir = path.join(__dirname, "src");
try {
  if (fs.existsSync(rootDir)) {
    console.log("src/");
    printTree(rootDir);
  } else {
    console.error(
      "Error: src directory not found. Ensure you are in the correct project root."
    );
  }
} catch (err) {
  console.error("Error generating tree:", err.message);
}
