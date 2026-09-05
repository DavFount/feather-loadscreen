(() => {
    'use strict';

    const config = window.FeatherLoadscreenConfig || {};
    const root = document.documentElement;
    const elements = {
        logo: document.getElementById('server-logo'),
        eyebrow: document.getElementById('eyebrow'),
        title: document.getElementById('server-title'),
        subtitle: document.getElementById('server-subtitle'),
        status: document.getElementById('status-text'),
        value: document.getElementById('progress-value'),
        track: document.getElementById('progress-track'),
        bar: document.getElementById('progress-bar'),
        tip: document.getElementById('tip-text'),
        links: document.getElementById('community-links'),
        discord: document.getElementById('discord-link'),
        website: document.getElementById('website-link'),
        build: document.getElementById('build-label')
    };
    const configuredStatus = config.statusMessages && typeof config.statusMessages === 'object'
        ? config.statusMessages
        : {};
    const status = {
        connecting: configuredStatus.connecting || 'Connecting to server',
        initializing: configuredStatus.initializing || 'Initializing game',
        map: configuredStatus.map || 'Preparing the frontier',
        environment: configuredStatus.environment || 'Setting up the world',
        session: configuredStatus.session || 'Joining your session',
        validating: configuredStatus.validating || 'Validating server assets',
        downloading: configuredStatus.downloading || 'Downloading server assets',
        dataFiles: configuredStatus.dataFiles || 'Loading game data',
        scripts: configuredStatus.scripts || 'Starting client systems',
        complete: configuredStatus.complete || 'Entering the frontier'
    };
    const stages = {
        INIT_BEFORE_MAP_LOADED: status.initializing,
        MAP_LOAD_PENDING: status.map,
        INIT_AFTER_MAP_LOADED: status.environment,
        INIT_SESSION: status.session
    };
    let progress = 0;
    let tipIndex = 0;
    let tipTimer;
    let backgroundTimer;
    let previewTimer;

    function setText(element, value) {
        if (typeof value === 'string' && value.trim()) element.textContent = value.trim();
    }

    function safeImagePath(value) {
        if (typeof value !== 'string') return null;
        const path = value.trim();
        if (!path || /["'();]/.test(path) || /^(?:https?:|data:|javascript:)/i.test(path)) return null;
        return path;
    }

    function setProgress(fraction) {
        const parsed = Number(fraction);
        if (!Number.isFinite(parsed)) return;
        const next = Math.max(0, Math.min(100, Math.round(parsed * 100)));
        progress = Math.max(progress, next);
        elements.bar.style.width = `${progress}%`;
        elements.value.textContent = `${progress}%`;
        elements.track.setAttribute('aria-valuenow', String(progress));
        if (progress >= 100) setText(elements.status, status.complete);
    }

    function setStatus(message) {
        if (typeof message !== 'string') return;
        const normalized = message.trim();
        if (stages[normalized]) setText(elements.status, stages[normalized]);
        else if (/validat/i.test(normalized)) setText(elements.status, status.validating);
        else if (/download/i.test(normalized)) setText(elements.status, status.downloading);
        else if (/session/i.test(normalized)) setText(elements.status, status.session);
    }

    const tips = Array.isArray(config.tips)
        ? config.tips.filter(tip => typeof tip === 'string' && tip.trim())
        : [];
    function showTip() {
        elements.tip.hidden = tips.length === 0;
        if (!tips.length) return;
        elements.tip.textContent = tips[tipIndex % tips.length];
        tipIndex += 1;
    }

    const configuredBackgrounds = Array.isArray(config.backgrounds)
        ? config.backgrounds
        : [config.background];
    const backgrounds = configuredBackgrounds.map(safeImagePath).filter(Boolean);
    const backdropLayers = Array.from(document.querySelectorAll('.backdrop'));
    const backgroundImages = Array.from(document.querySelectorAll('.background-image'));
    let backgroundIndex = config.randomizeFirstBackground !== false && backgrounds.length > 1
        ? Math.floor(Math.random() * backgrounds.length)
        : 0;
    let activeBackdrop = 0;

    function setLayerBackground(index, path) {
        if (backgroundImages[index]) backgroundImages[index].src = path;
    }

    function rotateBackground() {
        if (backgrounds.length < 2 || backdropLayers.length < 2) return;
        backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
        const nextBackdrop = activeBackdrop === 0 ? 1 : 0;
        const image = new Image();
        image.addEventListener('load', () => {
            setLayerBackground(nextBackdrop, backgrounds[backgroundIndex]);
            backdropLayers[nextBackdrop].classList.add('is-active');
            backdropLayers[activeBackdrop].classList.remove('is-active');
            activeBackdrop = nextBackdrop;
        }, { once: true });
        image.src = backgrounds[backgroundIndex];
    }

    function safeWebUrl(value) {
        if (typeof value !== 'string' || !value.trim()) return null;
        try {
            const url = new URL(value.trim());
            return url.protocol === 'https:' ? url.href : null;
        } catch (_) {
            return null;
        }
    }

    function configureLink(element, value) {
        const url = safeWebUrl(value);
        if (!url) return false;
        element.href = url;
        element.hidden = false;
        return true;
    }

    setText(elements.eyebrow, config.eyebrow);
    setText(elements.title, config.title);
    setText(elements.subtitle, config.subtitle);
    document.title = config.title || 'Feather Framework';
    setText(elements.status, status.connecting);
    if (typeof config.buildLabel === 'string' && config.buildLabel.trim()) {
        setText(elements.build, config.buildLabel);
        elements.build.hidden = false;
    }
    const links = config.links && typeof config.links === 'object' ? config.links : {};
    const hasDiscord = configureLink(elements.discord, links.discord);
    const hasWebsite = configureLink(elements.website, links.website);
    elements.links.hidden = !hasDiscord && !hasWebsite;
    if (typeof config.accent === 'string' && /^#[0-9a-f]{6}$/i.test(config.accent)) {
        root.style.setProperty('--accent', config.accent);
    }
    const logo = safeImagePath(config.logo);
    if (logo) {
        elements.logo.src = logo;
        elements.logo.alt = typeof config.logoAlt === 'string' ? config.logoAlt : '';
        elements.logo.hidden = false;
        elements.logo.addEventListener('error', () => { elements.logo.hidden = true; }, { once: true });
    }
    if (backgrounds.length) {
        backdropLayers.forEach((_, index) => setLayerBackground(index, backgrounds[backgroundIndex]));
    }
    if (typeof config.backgroundPosition === 'string'
        && /^[a-z\d.% -]+$/i.test(config.backgroundPosition)) {
        root.style.setProperty('--background-position', config.backgroundPosition);
    }
    const opacity = Number(config.overlayOpacity);
    if (Number.isFinite(opacity)) {
        root.style.setProperty('--overlay-opacity', String(Math.max(0, Math.min(1, opacity))));
    }

    showTip();
    if (tips.length > 1) {
        tipTimer = window.setInterval(showTip, Math.max(5000, Number(config.tipIntervalMs) || 9000));
    }
    if (backgrounds.length > 1) {
        backgroundTimer = window.setInterval(
            rotateBackground,
            Math.max(5000, Number(config.backgroundIntervalMs) || 12000)
        );
    }

    window.addEventListener('message', event => {
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        switch (data.eventName) {
            case 'loadProgress':
                setProgress(data.loadFraction);
                break;
            case 'onLogLine':
                setStatus(data.message);
                break;
            case 'startDataFileEntries':
            case 'onDataFileEntry':
            case 'endDataFileEntries':
                setText(elements.status, status.dataFiles);
                break;
            case 'performMapLoadFunction':
                setText(elements.status, status.map);
                break;
            case 'startInitFunction':
            case 'startInitFunctionOrder':
            case 'initFunctionInvoking':
            case 'initFunctionInvoked':
            case 'endInitFunction':
                setText(elements.status, status.scripts);
                break;
        }
    });

    // Open index.html?preview=1 in a browser to inspect the screen without RedM.
    if (new URLSearchParams(window.location.search).get('preview') === '1') {
        const previewStages = Object.keys(stages);
        let tick = 0;
        previewTimer = window.setInterval(() => {
            tick += 1;
            setProgress(Math.min(1, tick / 20));
            if (tick % 5 === 1) setStatus(previewStages[Math.floor(tick / 5) % previewStages.length]);
            if (tick >= 20) window.clearInterval(previewTimer);
        }, 350);
    }

    window.addEventListener('beforeunload', () => {
        if (tipTimer) window.clearInterval(tipTimer);
        if (backgroundTimer) window.clearInterval(backgroundTimer);
        if (previewTimer) window.clearInterval(previewTimer);
    });
})();
