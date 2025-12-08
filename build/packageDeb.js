const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const PACKAGE_JSON = path.join(__dirname, "../package.json");
const packageJson = fs.readJsonSync(PACKAGE_JSON);
const VERSION = packageJson.version;
console.log("Sonosphere version: ", VERSION);

const TEMPLATE_DIR = path.join(__dirname, "../deb-template");
const OUTPUT_DIR = path.join(__dirname, "../deb");
const STAGING_DIR = path.join(OUTPUT_DIR, "staging");
const UNPACKED = path.join(__dirname, "../dist/linux-arm64-unpacked");

const APP_TARGET_DIR = path.join(STAGING_DIR, "opt/sonosphere");
const CONTROL_FILE = path.join(STAGING_DIR, "DEBIAN/control");
const POSTINST_FILE = path.join(STAGING_DIR, "DEBIAN/postinst");
const POSTRM_FILE = path.join(STAGING_DIR, "DEBIAN/postrm");

if (fs.existsSync(STAGING_DIR)) {
    console.log("Removing existing staging directory");
    fs.removeSync(STAGING_DIR);
}
console.log("Copying template");
fs.copySync(TEMPLATE_DIR, STAGING_DIR);
console.log("Change chmod");
fs.chmodSync(POSTINST_FILE, 0o755);
fs.chmodSync(POSTRM_FILE, 0o755);
console.log("Replacing contents");
let controlContent = fs.readFileSync(CONTROL_FILE, "utf8");
controlContent = controlContent.replace(/\$VERSION/g, VERSION);
fs.writeFileSync(CONTROL_FILE, controlContent);

console.log("Copying unpacked app");
fs.ensureDirSync(APP_TARGET_DIR);
fs.copySync(UNPACKED, APP_TARGET_DIR);

console.log("PREPARING DONE");

console.log(`Building .deb`);
const OUTPUT_DEB_PATH = path.join(
    OUTPUT_DIR,
    `sonosphere-${VERSION}-arm64.deb`
);
execSync(`dpkg-deb --build ${STAGING_DIR} ${OUTPUT_DEB_PATH}`, {
    stdio: "inherit",
});

console.log("BUILDING DONE. output:", OUTPUT_DEB_PATH);
