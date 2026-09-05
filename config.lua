-- Main settings located in web/config.js

-- Server-owner settings for the load-screen lifecycle.
FeatherLoadscreenConfig = {
    -- Keep the load screen visible until Feather Character opens the character
    -- selection or creation menu. Set false to close as soon as the network
    -- session starts, which approximates CFX's automatic shutdown behavior.
    ManualShutdown = true,

    -- Safety net for manual mode. Once the network session starts, close the
    -- load screen after this many milliseconds if no readiness event arrives.
    -- Set to 0 to disable the fallback (not recommended).
    ManualShutdownFallbackMs = 120000,
}
