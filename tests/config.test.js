'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const window = {};
vm.runInNewContext(fs.readFileSync('web/config.js', 'utf8'), { window });
const config = window.FeatherLoadscreenConfig;
assert(config && typeof config === 'object', 'load-screen config must be an object');
assert(Array.isArray(config.backgrounds) && config.backgrounds.length > 0,
    'at least one background is required');

const assets = [...config.backgrounds, config.logo].filter(Boolean);
for (const asset of assets) {
    assert.equal(typeof asset, 'string');
    assert(!/^(?:https?:|data:|javascript:)/i.test(asset), `${asset} must be local`);
    assert(fs.existsSync(path.join('web', asset)), `${asset} does not exist`);
}

for (const [name, value] of Object.entries(config.links || {})) {
    if (!value) continue;
    const url = new URL(value);
    assert.equal(url.protocol, 'https:', `${name} must use HTTPS`);
}

for (const [name, value] of Object.entries(config.statusMessages || {})) {
    assert.equal(typeof value, 'string', `${name} status must be text`);
    assert(value.trim(), `${name} status must not be empty`);
}

console.log(`Load-screen config checks passed: ${assets.length} local assets.`);
