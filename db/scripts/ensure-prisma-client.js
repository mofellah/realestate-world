const fs = require("fs");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "..", "..");
const target = path.join(workspaceRoot, "node_modules", "@prisma", "client");
const link = path.join(__dirname, "..", "node_modules", "@prisma", "client");

if (fs.existsSync(link)) {
  process.exit(0);
}

if (!fs.existsSync(target)) {
  console.error("[ensure-prisma-client] Missing @prisma/client at", target);
  process.exit(1);
}

fs.mkdirSync(path.dirname(link), { recursive: true });

const linkType = process.platform === "win32" ? "junction" : "dir";
fs.symlinkSync(target, link, linkType);
console.log("[ensure-prisma-client] Linked @prisma/client to db/node_modules");
