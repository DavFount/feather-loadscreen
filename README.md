# feather-loadscreen

A lightweight, dependency-free RedM loading screen.

## Installation

```cfg
ensure feather-loadscreen
```

Only one resource should declare a load screen. Disable other load-screen
resources to avoid an unpredictable selection.

Copy the setting in `server.cfg.example` into the main `server.cfg` if the
default CFX busy spinner should be hidden. The manifest enables
`loadscreen_cursor` so configured community links can be clicked.

## Configuration

Edit `web/config.js` to change the title, subtitle, accent, logo, backgrounds,
position, overlay strength, tips, and rotation intervals. Asset paths are
relative to `web/index.html`. Place additional local images in
`web/assets/images`; the manifest packages that directory automatically.

Edit `config.lua` to control when the load screen closes. Presentation settings
belong in `web/config.js`; lifecycle settings belong in `config.lua`.

Examples:

```js
logo: 'assets/images/feather-logo-subdued.png',
backgrounds: [
    'assets/images/background-gunfighter.webp',
    'assets/images/background-town.jpg'
],
randomizeFirstBackground: true,
backgroundPosition: 'center 35%',
backgroundIntervalMs: 12000,
overlayOpacity: 0.72,
buildLabel: 'Alpha',
links: {
    discord: 'https://discord.gg/example',
    website: 'https://example.com'
},
```

The included Feather logo is enabled by default. Set `logo` to an empty string
to hide it or point it to another image in `web/assets/images`. Images must be packaged local files;
remote and data URLs are rejected. Backgrounds cross-fade when more than one
valid path is configured. Set `randomizeFirstBackground` to `false` to
always start with the first configured image.

Community links are optional, must use HTTPS, and remain hidden when empty.
Set `buildLabel` to an empty string to hide it. All loading-stage wording can
be changed under `statusMessages` without editing the UI script.

The load screen handles every event currently documented by CFX: progress,
log lines, data-file loading, map loading, and client initialization events.

### Manual shutdown

The manifest enables CFX manual shutdown. `config.lua` decides how Feather uses
it:

```lua
FeatherLoadscreenConfig = {
    ManualShutdown = true,
    ManualShutdownFallbackMs = 120000,
}
```

With `ManualShutdown = true`, Feather Character closes the load screen after
the character-selection menu (or the creation menu for a new account) opens.
The fallback closes it after the configured delay once the network session has
started, preventing a character-loading error from trapping the player behind
the overlay. Set `ManualShutdown = false` to close when the network session
starts instead. Restart `feather-loadscreen` after changing this Lua setting.

## Browser preview

Open `web/index.html?preview=1` in a browser. Preview mode simulates status and
progress updates, rotates tips and backgrounds, and requires no RedM connection.
Open `web/index.html` without the query to see the normal zero-progress state.

Run `node tests/ui.test.js` for the configuration and CFX event regression checks.

The UI uses standard CFX `loadProgress` and `onLogLine` messages. It clamps bad
progress values and never moves the displayed progress backward.

## Verification

Reconnect after restarting the resource. Confirm the progress value and bar
advance together, status text changes, tips rotate, and the layout remains
readable at 16:9, ultrawide, and low resolutions.

Run the local checks with Node.js:

```text
node --check web/config.js
node --check web/js/script.js
node tests/config.test.js
node tests/ui.test.js
node tests/lifecycle.test.js
```

GitHub Actions runs the same checks from `.github/workflows/validate.yml`.
Use `docs/acceptance.md` for the final live RedM release pass.
