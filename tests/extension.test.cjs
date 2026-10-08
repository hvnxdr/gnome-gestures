const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {test} = require('node:test');
const vm = require('node:vm');

function fixture(initialEnabled = true) {
    let enabled = initialEnabled;
    let callback;
    const gesture = {
        get enabled() { return enabled; },
        set enabled(value) {
            if (value === enabled)
                return;
            enabled = value;
            callback?.();
        },
        connect(signal, handler) {
            assert.equal(signal, 'notify::enabled');
            callback = handler;
            return 1;
        },
        disconnect(id) {
            assert.equal(id, 1);
            callback = undefined;
        },
    };
    const touchscreen = {enabled: true};
    const workspace = {enabled: true};
    const tracker = {orientation: 1, enabled: true,
        _touchpadGesture: gesture, _panGesture: touchscreen};
    const source = readFileSync(`${__dirname}/../extension.js`, 'utf8')
        .replace(/^import .*;\n/gm, '')
        .replace('export default class', 'class');
    const ExtensionClass = vm.runInNewContext(`${source}\nDisableOverviewSwipe;`, {
        Clutter: {Orientation: {VERTICAL: 1}},
        Main: {overview: {_swipeTracker: tracker}},
        Extension: class {},
    });
    return {extension: new ExtensionClass(), gesture, tracker, touchscreen, workspace};
}

test('blocks touchpad after binding updates and preserves other inputs', () => {
    const {extension, gesture, tracker, touchscreen, workspace} = fixture();
    extension.enable();
    assert.equal(gesture.enabled, false);
    tracker.enabled = false;
    gesture.enabled = false;
    tracker.enabled = true;
    gesture.enabled = true;
    assert.equal(gesture.enabled, false);
    assert.equal(tracker.enabled, true);
    assert.equal(touchscreen.enabled, true);
    assert.equal(workspace.enabled, true);
    extension.disable();
    assert.equal(gesture.enabled, true);
    gesture.enabled = false;
    gesture.enabled = true;
    assert.equal(gesture.enabled, true);
    extension.enable();
    assert.equal(gesture.enabled, false);
    extension.disable();
    assert.equal(gesture.enabled, true);
});

test('restores an initially disabled gesture', () => {
    const {extension, gesture} = fixture(false);
    extension.enable();
    extension.disable();
    assert.equal(gesture.enabled, false);
});

test('respects parent disabled during extension lifetime', () => {
    const {extension, gesture, tracker} = fixture();
    extension.enable();
    tracker.enabled = false;
    extension.disable();
    assert.equal(gesture.enabled, false);
});

test('rejects incompatible tracker before mutation', () => {
    const {extension, gesture, tracker} = fixture();
    tracker.orientation = 0;
    assert.throws(() => extension.enable(), /unavailable/);
    assert.equal(gesture.enabled, true);
    extension.disable();
});
