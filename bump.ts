import fs from 'fs';

/**
 * Increments version of core/sdk and core/ui
 * Usage: ts-node bump.ts {module}={bumpType} where module = sdk, ui & bumpType = major, minor, patch
 * e.g. ts-node bump.ts ui=patch
 * e.g. ts-node bump.ts sdk=patch ui=patch
 */

let sdk = JSON.parse(fs.readFileSync('./core/sdk/package.json').toString());
let cli = JSON.parse(fs.readFileSync('./core/cli/package.json').toString());
let ui = JSON.parse(fs.readFileSync('./core/ui/package.json').toString());

function bumpVersion(version: string, bump: string): string {
  let [major, minor, patch] = version.split('.').map(Number);

  if (bump === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  let newVersion = `${major}.${minor}.${patch}`;
  console.log(`Bump version from ${version} to ${newVersion}`);

  return newVersion;
}

function writeFile(path: string, data: object) {
  let str = JSON.stringify(data, null, '  ') + '\n';
  fs.writeFileSync(path, Buffer.from(str));
}

// Bump version
process.argv.slice(2).forEach((val) => {
  let [name, bump] = val.split('=');
  console.log(`${name} ${bump}`);

  if (name === 'sdk') {
    let newVersion = bumpVersion(sdk.version, bump);
    sdk.version = newVersion;
    cli.dependencies['@liqnft/candy-shop-sdk'] = newVersion;
    ui.dependencies['@liqnft/candy-shop-sdk'] = newVersion;
  }

  if (name === 'ui') {
    let newVersion = bumpVersion(ui.version, bump);
    ui.version = newVersion;
  }
});

// Update files
writeFile('./core/sdk/package.json', sdk);
writeFile('./core/cli/package.json', cli);
writeFile('./core/ui/package.json', ui);
