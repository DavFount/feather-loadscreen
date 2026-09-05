'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function element() {
    const attributes = {};
    return {
        textContent: '', hidden: false, src: '', alt: '', href: '',
        style: { values: {}, setProperty(key, value) { this.values[key] = value; } },
        classList: { add() {}, remove() {} },
        setAttribute(key, value) { attributes[key] = value; },
        getAttribute(key) { return attributes[key]; },
        addEventListener() {}
    };
}

const ids = Object.fromEntries([
    'server-logo', 'eyebrow', 'server-title', 'server-subtitle', 'status-text',
    'progress-value', 'progress-track', 'progress-bar', 'tip-text',
    'community-links', 'discord-link', 'website-link', 'build-label'
].map(id => [id, element()]));
const backdrops = [element(), element()];
const backgroundImages = [element(), element()];
const listeners = {};
const window = {
    location: { search: '' },
    addEventListener(name, callback) { listeners[name] = callback; },
    setInterval() { return 1; },
    clearInterval() {}
};
const document = {
    title: '',
    documentElement: element(),
    getElementById(id) { return ids[id]; },
    querySelectorAll(selector) {
        if (selector === '.backdrop') return backdrops;
        if (selector === '.background-image') return backgroundImages;
        return [];
    }
};
class Image { addEventListener() {} set src(_) {} }
const context = vm.createContext({ window, document, Image, URL, URLSearchParams, Number, Array });
vm.runInContext(fs.readFileSync('web/config.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('web/js/script.js', 'utf8'), context);

assert.equal(document.title, 'Welcome to the Frontier');
assert.equal(ids['build-label'].textContent, 'Alpha');
assert.equal(ids['community-links'].hidden, true, 'empty optional links stay hidden');
assert.match(backgroundImages[0].src, /background-.+\.webp/);
listeners.message({ data: { eventName: 'loadProgress', loadFraction: 0.52 } });
assert.equal(ids['progress-value'].textContent, '52%');
assert.equal(ids['progress-track'].getAttribute('aria-valuenow'), '52');
listeners.message({ data: { eventName: 'loadProgress', loadFraction: 0.2 } });
assert.equal(ids['progress-value'].textContent, '52%', 'progress must not move backward');
listeners.message({ data: { eventName: 'loadProgress', loadFraction: 2 } });
assert.equal(ids['progress-value'].textContent, '100%');
assert.equal(ids['status-text'].textContent, 'Entering the frontier');
listeners.message({ data: { eventName: 'onLogLine', message: 'INIT_SESSION' } });
assert.equal(ids['status-text'].textContent, 'Joining your session');
listeners.message({ data: { eventName: 'startDataFileEntries' } });
assert.equal(ids['status-text'].textContent, 'Loading game data');
listeners.message({ data: { eventName: 'initFunctionInvoking' } });
assert.equal(ids['status-text'].textContent, 'Starting client systems');
listeners.message({ data: { eventName: 'performMapLoadFunction' } });
assert.equal(ids['status-text'].textContent, 'Preparing the frontier');
listeners.message({ data: null });

console.log('Load-screen UI checks passed.');
