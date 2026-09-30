/**
 * TERMIART STUDIO — CLIENT-SIDE CREATIVE CONTROLLER
 * Inspired by Awwwards Wonder Games: Playful, Tactile, Living, Editorial
 */

(() => {
  "use strict";

  // =========================================================================
  // 1. APPLICATION STATE
  // =========================================================================
  const state = {
    file: null,
    imageBase64: null,
    sampleName: "portrait",
    style: "halfblock",
    theme: "cyberpunk",
    preset: "",
    width: 100,
    contrast: 1.0,
    brightness: 1.0,
    sharpness: 1.0,
    gamma: 1.0,
    density: 1.0,
    edgeEnhance: false,
    invert: false,
    color: true,
    crt: false,
    fontSize: 11,
    isAnimating: false,
    animFrame: 0,
    animType: "matrix",
    animFps: 15,
    animIntervalId: null,
    lastRenderResult: null,
    soundEnabled: true,
    audioCtx: null,
    isSurpriseScrambling: false,
  };

  // =========================================================================
  // 2. RETRO WEB AUDIO SYNTHESIZER (No external files needed)
  // =========================================================================
  const audio = {
    init() {
      if (!state.audioCtx && typeof window.AudioContext !== "undefined") {
        try {
          state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          // Audio not allowed or supported
        }
      }
      if (state.audioCtx && state.audioCtx.state === "suspended") {
        state.audioCtx.resume();
      }
    },

    playTone(freq, type = "sine", duration = 0.08, gainVal = 0.05) {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      try {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, state.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(state.audioCtx.destination);
        osc.start();
        osc.stop(state.audioCtx.currentTime + duration);
      } catch (e) {}
    },

    click() {
      this.playTone(800, "sine", 0.04, 0.04);
    },

    success() {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, "triangle", 0.1, 0.05), idx * 60);
      });
    },

    surprise() {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      const notes = [329.63, 440.00, 554.37, 659.25, 880.00];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, "square", 0.06, 0.03), idx * 45);
      });
    },

    easterEgg() {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      const notes = [440, 554, 659, 880, 1108, 1318];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, "sawtooth", 0.14, 0.04), idx * 70);
      });
    }
  };

  // =========================================================================
  // 3. DOM ELEMENT REFERENCES
  // =========================================================================
  const dom = {
    // Navigation
    btnSound: document.getElementById("btn-sound"),
    soundIcon: document.getElementById("sound-icon"),
    btnNavRandom: document.getElementById("btn-nav-random"),
    btnNavUpload: document.getElementById("btn-nav-upload"),
    brandLogo: document.getElementById("brand-logo"),
    logoText: document.getElementById("logo-text"),
    logoGlyph: document.getElementById("logo-glyph"),

    // Hero Section
    btnHeroDrop: document.getElementById("btn-hero-drop"),
    btnHeroRandom: document.getElementById("btn-hero-random"),
    btnHeroDemo: document.getElementById("btn-hero-demo"),
    starterCards: document.querySelectorAll(".starter-card"),

    // Source Card & Dropzone
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("file-input"),
    dropzonePrompt: document.getElementById("dropzone-prompt"),
    thumbnailWrapper: document.getElementById("thumbnail-wrapper"),
    imageThumbnail: document.getElementById("image-thumbnail"),
    thumbName: document.getElementById("thumb-name"),
    btnRemoveImage: document.getElementById("btn-remove-image"),

    // Presets
    presetsContainer: document.getElementById("presets-container"),

    // Mini Shell Easter Egg
    shellForm: document.getElementById("shell-form"),
    shellInput: document.getElementById("shell-input"),
    shellOutput: document.getElementById("shell-output"),

    // Terminal Stage
    terminalWindow: document.getElementById("terminal-window"),
    terminalViewport: document.getElementById("terminal-viewport"),
    terminalPre: document.getElementById("terminal-pre"),
    terminalLoader: document.getElementById("terminal-loader"),
    loaderTicker: document.getElementById("loader-ticker"),
    terminalTitleText: document.getElementById("terminal-title-text"),
    telCols: document.getElementById("tel-cols"),
    telRows: document.getElementById("tel-rows"),
    telTime: document.getElementById("tel-time"),
    telStatusLabel: document.getElementById("tel-status-label"),
    decoderOverlay: document.getElementById("decoder-overlay"),
    decoderLogs: document.getElementById("decoder-logs"),

    // Window Dots
    dotClose: document.getElementById("dot-close"),
    dotMin: document.getElementById("dot-min"),
    btnFullscreenDot: document.getElementById("btn-fullscreen-dot"),

    // Badges in stage footer
    badgeRenderer: document.getElementById("badge-renderer"),
    badgeTheme: document.getElementById("badge-theme"),
    badgeFps: document.getElementById("badge-fps"),

    // Stage Action Bar
    btnCopyMain: document.getElementById("btn-copy-main"),
    btnCopyLabel: document.getElementById("btn-copy-label"),
    btnShareModal: document.getElementById("btn-share-modal"),
    btnDownloadPng: document.getElementById("btn-download-png"),
    btnToggleAnim: document.getElementById("btn-toggle-anim"),
    animIcon: document.getElementById("anim-icon"),
    animBtnLabel: document.getElementById("anim-btn-label"),
    btnRandomRoll: document.getElementById("btn-random-roll"),
    btnFullscreen: document.getElementById("btn-fullscreen"),

    // CLI Snippet
    cliCommandText: document.getElementById("cli-command-text"),
    btnCopyCli: document.getElementById("btn-copy-cli"),

    // Controls Panel
    stylesContainer: document.getElementById("styles-container"),
    themesContainer: document.getElementById("themes-container"),
    sliderWidth: document.getElementById("slider-width"),
    valWidth: document.getElementById("val-width"),
    sliderDensity: document.getElementById("slider-density"),
    valDensity: document.getElementById("val-density"),

    // Animation Controls
    animTypeSelect: document.getElementById("anim-type-select"),
    animLiveBadge: document.getElementById("anim-live-badge"),
    sliderFps: document.getElementById("slider-fps"),
    valFps: document.getElementById("val-fps"),

    // Advanced Accordion & Sliders
    btnToggleAdvanced: document.getElementById("btn-toggle-advanced"),
    advancedDrawer: document.getElementById("advanced-drawer"),
    btnResetSliders: document.getElementById("btn-reset-sliders"),
    sliderContrast: document.getElementById("slider-contrast"),
    valContrast: document.getElementById("val-contrast"),
    sliderBrightness: document.getElementById("slider-brightness"),
    valBrightness: document.getElementById("val-brightness"),
    sliderSharpness: document.getElementById("slider-sharpness"),
    valSharpness: document.getElementById("val-sharpness"),
    sliderGamma: document.getElementById("slider-gamma"),
    valGamma: document.getElementById("val-gamma"),
    checkEdge: document.getElementById("check-edge"),
    checkInvert: document.getElementById("check-invert"),
    checkColor: document.getElementById("check-color"),
    checkCrt: document.getElementById("check-crt"),
    crtOverlay: document.getElementById("crt-overlay"),
    btnFontDown: document.getElementById("btn-font-down"),
    btnFontUp: document.getElementById("btn-font-up"),
    valFontSize: document.getElementById("val-font-size"),

    // Modals
    modalCopy: document.getElementById("modal-copy"),
    btnCloseCopy: document.getElementById("btn-close-copy"),
    btnCopyPlainAction: document.getElementById("btn-copy-plain-action"),
    btnCopyAnsiAction: document.getElementById("btn-copy-ansi-action"),
    btnCopyMdAction: document.getElementById("btn-copy-md-action"),
    btnCopyHtmlAction: document.getElementById("btn-copy-html-action"),

    modalShare: document.getElementById("modal-share"),
    btnCloseShare: document.getElementById("btn-close-share"),
    btnShareWhatsappImg: document.getElementById("btn-share-whatsapp-img"),
    btnShareWhatsappTxt: document.getElementById("btn-share-whatsapp-txt"),
    btnShareDiscordMd: document.getElementById("btn-share-discord-md"),
    btnShareDiscordPng: document.getElementById("btn-share-discord-png"),
    btnShareSlackCode: document.getElementById("btn-share-slack-code"),
    btnShareSlackPng: document.getElementById("btn-share-slack-png"),
    btnShareXIntent: document.getElementById("btn-share-x-intent"),
    btnShareXCaption: document.getElementById("btn-share-x-caption"),
    btnModalDlPng: document.getElementById("btn-modal-dl-png"),
    btnModalDlTxt: document.getElementById("btn-modal-dl-txt"),
    btnModalDlAns: document.getElementById("btn-modal-dl-ans"),
    btnModalDlHtml: document.getElementById("btn-modal-dl-html"),

    modalEasterEgg: document.getElementById("modal-easter-egg"),
    btnDismissEgg: document.getElementById("btn-dismiss-egg"),

    // Utilities
    toastContainer: document.getElementById("toast-container"),
    exportCanvas: document.getElementById("export-canvas"),
  };

  // =========================================================================
  // 4. TOAST NOTIFICATION SYSTEM
  // =========================================================================
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "success" ? "toast-success" : "toast-error"}`;
    toast.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>${message}</span>
    `;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================================
  // 5. CORE RENDERING ENGINE CALL
  // =========================================================================
  let renderDebounceTimer = null;

  async function triggerRender(immediate = false) {
    if (state.isAnimating) return; // Don't interrupt animation loop

    if (!immediate) {
      clearTimeout(renderDebounceTimer);
      renderDebounceTimer = setTimeout(() => executeRender(), 180);
    } else {
      clearTimeout(renderDebounceTimer);
      await executeRender();
    }
  }

  async function executeRender() {
    dom.terminalLoader.classList.remove("hidden");
    dom.telStatusLabel.textContent = "COMPUTING";
    rotateTicker();

    const formData = new FormData();
    if (state.file) {
      formData.append("file", state.file);
    } else if (state.imageBase64) {
      formData.append("image_base64", state.imageBase64);
    } else {
      formData.append("sample_name", state.sampleName || "portrait");
    }

    formData.append("style", state.style);
    formData.append("theme", state.theme);
    if (state.preset) formData.append("preset", state.preset);
    formData.append("width", state.width);
    formData.append("contrast", state.contrast);
    formData.append("brightness", state.brightness);
    formData.append("sharpness", state.sharpness);
    formData.append("gamma", state.gamma);
    formData.append("density", state.density);
    formData.append("edge_enhance", state.edgeEnhance);
    formData.append("invert", state.invert);
    formData.append("color", state.color);

    try {
      const resp = await fetch("/api/render", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.detail || "Server error while rendering terminal art.");
      }

      const data = await resp.json();
      state.lastRenderResult = data;

      // Update terminal view
      dom.terminalPre.innerHTML = data.html;

      // Telemetry update
      dom.telCols.textContent = `COLS: ${data.stats.cols}`;
      dom.telRows.textContent = `ROWS: ${data.stats.rows}`;
      dom.telTime.textContent = `${data.stats.render_time_ms}ms`;
      dom.telStatusLabel.textContent = "READY";

      // Status badges
      dom.badgeRenderer.textContent = `RENDERER: ${data.stats.style.toUpperCase()}`;
      dom.badgeTheme.textContent = `THEME: ${data.stats.theme.toUpperCase()}`;
      dom.terminalTitleText.textContent = `termiart -s ${data.stats.style} -t ${data.stats.theme} (${data.stats.cols} cols)`;

      // CLI Command Snippet
      dom.cliCommandText.textContent = data.cli_command;

      audio.click();
    } catch (err) {
      console.error(err);
      dom.terminalPre.innerHTML = `<span style="color:#ff007f;">Error: ${err.message}</span>`;
      dom.telStatusLabel.textContent = "HALTED";
      showToast(err.message, "error");
    } finally {
      dom.terminalLoader.classList.add("hidden");
    }
  }

  // Playful loading ticker messages
  const tickerMessages = [
    "COMPILING PIXELS...",
    "CONVERTING PHOTONS...",
    "NEGOTIATING WITH ASCII...",
    "MAPPING SUBPIXEL MATRICES...",
    "APPLYING TRUECOLOR ANIS...",
    "GENERATING ARTIFACT..."
  ];
  let tickerIndex = 0;
  function rotateTicker() {
    dom.loaderTicker.textContent = tickerMessages[tickerIndex % tickerMessages.length];
    tickerIndex++;
  }

  // =========================================================================
  // 6. SURPRISE ME (RANDOMIZE) WITH RETRO DECODER ANIMATION
  // =========================================================================
  const allStyles = ["halfblock", "dense_ascii", "braille", "matrix", "ascii", "unicode", "cyberpunk", "rgb"];
  const allThemes = ["original", "cyberpunk", "matrix", "rainbow", "fire", "ocean", "purple_neon", "monochrome", "anime"];

  async function triggerSurpriseMe() {
    if (state.isSurpriseScrambling) return;
    state.isSurpriseScrambling = true;

    audio.surprise();
    dom.decoderOverlay.classList.remove("hidden");

    // Scramble log animation
    const steps = [
      "INITIATING QUANTUM DECODER...",
      "SAMPLING ENTROPY SEED [0x7F4A]...",
      "MUTATING GLYPH MATRICES...",
      "STYLE DISCOVERED: SYNCHRONIZING..."
    ];

    for (let i = 0; i < steps.length; i++) {
      dom.decoderLogs.innerHTML += `<p class="log-line ${i === steps.length - 1 ? 'highlight' : ''}">${steps[i]}</p>`;
      await new Promise(r => setTimeout(r, 120));
    }

    // Pick random combination
    const randomStyle = allStyles[Math.floor(Math.random() * allStyles.length)];
    const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
    const randomDensity = +(0.8 + Math.random() * 0.5).toFixed(2);
    const randomContrast = +(0.9 + Math.random() * 0.6).toFixed(2);

    state.style = randomStyle;
    state.theme = randomTheme;
    state.density = randomDensity;
    state.contrast = randomContrast;
    state.preset = "";

    // Sync UI elements
    syncUIWithState();

    // Re-render
    await executeRender();

    setTimeout(() => {
      dom.decoderOverlay.classList.add("hidden");
      dom.decoderLogs.innerHTML = "";
      state.isSurpriseScrambling = false;
      showToast(`✨ Surprise! ${randomStyle.toUpperCase()} in ${randomTheme.toUpperCase()}`);
      audio.success();
    }, 200);
  }

  function syncUIWithState() {
    // Styles
    document.querySelectorAll(".renderer-tile").forEach(tile => {
      const val = tile.querySelector("input").value;
      if (val === state.style) {
        tile.classList.add("active");
        tile.querySelector("input").checked = true;
      } else {
        tile.classList.remove("active");
      }
    });

    // Themes
    document.querySelectorAll(".palette-chip").forEach(chip => {
      const val = chip.querySelector("input").value;
      if (val === state.theme) {
        chip.classList.add("active");
        chip.querySelector("input").checked = true;
      } else {
        chip.classList.remove("active");
      }
    });

    // Sliders
    dom.sliderDensity.value = state.density;
    dom.valDensity.textContent = `${state.density.toFixed(2)}×`;
    dom.sliderContrast.value = state.contrast;
    dom.valContrast.textContent = `${state.contrast.toFixed(2)}×`;
  }

  // =========================================================================
  // 7. DEMO / STARTER IMAGES
  // =========================================================================
  const sampleMeta = {
    portrait: { style: "halfblock", theme: "cyberpunk", name: "portrait.png" },
    anime: { style: "dense_ascii", theme: "anime", name: "anime.png" },
    landscape: { style: "halfblock", theme: "fire", name: "landscape.png" },
    architecture: { style: "unicode", theme: "cyberpunk", name: "architecture.png" },
    animals: { style: "braille", theme: "rainbow", name: "animals.png" },
    logo: { style: "braille", theme: "matrix", name: "logo.png" },
  };

  function loadSample(sampleKey) {
    const meta = sampleMeta[sampleKey] || sampleMeta.portrait;
    state.file = null;
    state.imageBase64 = null;
    state.sampleName = sampleKey;
    state.style = meta.style;
    state.theme = meta.theme;
    state.preset = "";

    // Update thumbnail in source card
    dom.imageThumbnail.src = `/api/sample/${sampleKey}`;
    dom.thumbName.textContent = meta.name;
    dom.thumbnailWrapper.classList.remove("hidden");
    dom.dropzonePrompt.classList.add("hidden");

    // Highlight starter card
    dom.starterCards.forEach(card => {
      if (card.dataset.sample === sampleKey) card.classList.add("active");
      else card.classList.remove("active");
    });

    syncUIWithState();
    triggerRender(true);
  }

  // =========================================================================
  // 8. IMAGE UPLOAD & DRAG/DROP WITH PROGRESSIVE TERMINAL STATUS
  // =========================================================================
  async function handleFileSelected(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please provide a valid image file (PNG, JPG, WebP)", "error");
      return;
    }

    state.file = file;
    state.sampleName = null;
    state.imageBase64 = null;

    // Progressive Terminal Upload Sequence
    dom.terminalLoader.classList.remove("hidden");
    dom.telStatusLabel.textContent = "INSPECTING";
    const uploadSequence = [
      "IMAGE RECEIVED",
      "ANALYZING IMAGE...",
      "MAPPING PIXELS...",
      "CHOOSING CHARACTERS...",
      "BUILDING TERMINAL...",
      "ARTIFACT READY."
    ];

    for (let step of uploadSequence) {
      dom.loaderTicker.textContent = step;
      await new Promise(r => setTimeout(r, 90));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      dom.imageThumbnail.src = e.target.result;
      dom.thumbName.textContent = file.name;
      dom.thumbnailWrapper.classList.remove("hidden");
      dom.dropzonePrompt.classList.add("hidden");
      state.imageBase64 = e.target.result;

      handleRouteNavigation("/create");
      triggerRender(true);
      showToast(`Artifact generated from ${file.name}`);
      audio.success();
    };
    reader.readAsDataURL(file);
  }

  // =========================================================================
  // 9. COPY EXPERIENCE (THE COPY CENTER)
  // =========================================================================
  async function copyToClipboard(text, successMsg = "✓ COPIED TO CLIPBOARD") {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      audio.success();
      showToast(successMsg);

      // Flash CTA button
      dom.btnCopyMain.classList.add("copied");
      dom.btnCopyLabel.textContent = "COPIED!";
      setTimeout(() => {
        dom.btnCopyMain.classList.remove("copied");
        dom.btnCopyLabel.textContent = "COPY ART";
      }, 1800);
    } catch (e) {
      console.error(e);
      showToast("Clipboard copy failed. Please select and copy manually.", "error");
    }
  }

  function getMarkdownOutput() {
    if (!state.lastRenderResult) return "";
    return "```ansi\n" + (state.lastRenderResult.ansi || state.lastRenderResult.plain) + "\n```";
  }

  function getHtmlOutput() {
    if (!state.lastRenderResult) return "";
    return `<!DOCTYPE html><html><body style="background:#090a10;color:#fff;font-family:monospace;white-space:pre;">\n<pre>${state.lastRenderResult.html}</pre>\n</body></html>`;
  }

  // =========================================================================
  // 10. EXPORT & DOWNLOAD SYSTEM (PNG Canvas Rasterizer)
  // =========================================================================
  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
    audio.success();
  }

  async function rasterizeToPng() {
    if (!state.lastRenderResult) {
      showToast("No artwork available to export", "error");
      return;
    }

    showToast("Rendering High-Res PNG snapshot...");
    const canvas = dom.exportCanvas;
    const ctx = canvas.getContext("2d");

    const plain = state.lastRenderResult.plain;
    const lines = plain.split("\n");
    const numRows = lines.length;
    const numCols = Math.max(...lines.map(l => l.length));

    // Typography metrics for high-resolution canvas
    const charWidth = 9.5;
    const charHeight = 15;
    const padding = 36;
    const titleBarHeight = 40;

    canvas.width = Math.ceil(numCols * charWidth + padding * 2);
    canvas.height = Math.ceil(numRows * charHeight + padding * 2 + titleBarHeight);

    // 1. Draw sleek terminal window background
    ctx.fillStyle = "#090a10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw title bar
    ctx.fillStyle = "#131622";
    ctx.fillRect(0, 0, canvas.width, titleBarHeight);

    // Window dots
    const dotColors = ["#ff5f56", "#ffbd2e", "#27c93f"];
    dotColors.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(padding + i * 18, titleBarHeight / 2, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // Title text
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#9ba3b8";
    ctx.fillText("TERMIART // 24-BIT LIVING ARTWORK", padding + 70, titleBarHeight / 2 + 4);

    // Watermark
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#4a5568";
    ctx.fillText("termiart.app", canvas.width - padding - 85, titleBarHeight / 2 + 4);

    // 3. Render character glyphs with HTML spans colors
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.textBaseline = "top";

    // Parse styled HTML spans into colored character chunks
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = state.lastRenderResult.html;

    let curX = padding;
    let curY = padding + titleBarHeight;

    function renderNode(node, currentStyle = "#ffffff") {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === "\n") {
            curX = padding;
            curY += charHeight;
          } else {
            ctx.fillStyle = currentStyle;
            ctx.fillText(ch, curX, curY);
            curX += charWidth;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        let style = currentStyle;
        if (node.style && node.style.color) {
          style = node.style.color;
        }
        for (const child of node.childNodes) {
          renderNode(child, style);
        }
      }
    }

    renderNode(tempDiv, "#ffffff");

    // 4. Download generated PNG
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `termiart_${state.style}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("✓ PNG Snapshot saved!");
      audio.success();
    }, "image/png");
  }

  // =========================================================================
  // 11. LIVE ANIMATION STUDIO
  // =========================================================================
  function toggleAnimation() {
    if (state.isAnimating) {
      stopAnimation();
    } else {
      startAnimation();
    }
  }

  function startAnimation() {
    state.isAnimating = true;
    state.animFrame = 0;
    dom.animIcon.textContent = "⏸";
    dom.animBtnLabel.textContent = "PAUSE";
    dom.animLiveBadge.textContent = "STREAMING";
    dom.animLiveBadge.style.color = "var(--neon-green)";
    dom.badgeFps.textContent = `FPS: ${state.animFps}`;

    const intervalMs = Math.round(1000 / state.animFps);
    state.animIntervalId = setInterval(fetchNextFrame, intervalMs);
    showToast(`Animation started: ${state.animType.toUpperCase()}`);
    audio.click();
  }

  function stopAnimation() {
    state.isAnimating = false;
    clearInterval(state.animIntervalId);
    state.animIntervalId = null;
    dom.animIcon.textContent = "▶";
    dom.animBtnLabel.textContent = "ANIMATE";
    dom.animLiveBadge.textContent = "STANDBY";
    dom.animLiveBadge.style.color = "var(--color-text-dim)";
    audio.click();
  }

  async function fetchNextFrame() {
    const formData = new FormData();
    formData.append("frame", state.animFrame++);
    formData.append("anim_type", state.animType);
    formData.append("style", state.style);
    formData.append("theme", state.theme);
    formData.append("width", state.width);
    formData.append("contrast", state.contrast);
    formData.append("brightness", state.brightness);
    formData.append("sharpness", state.sharpness);

    try {
      const resp = await fetch("/api/animate-frame", {
        method: "POST",
        body: formData,
      });
      if (resp.ok) {
        const data = await resp.json();
        dom.terminalPre.innerHTML = data.html;
      }
    } catch (e) {
      stopAnimation();
    }
  }

  // =========================================================================
  // 12. EASTER EGGS (sudo art, Konami Code, Logo Glitch)
  // =========================================================================
  // 1. Mini shell command handler
  function handleShellCommand(cmd) {
    const cleanCmd = cmd.trim().toLowerCase();
    dom.shellOutput.classList.remove("hidden");

    if (cleanCmd === "sudo art") {
      audio.click();
      dom.shellOutput.innerHTML = `<strong>"Nice try."</strong> — Terminal root privileges restricted.`;
    } else if (cleanCmd === "help") {
      dom.shellOutput.innerHTML = `Commands: <code>sudo art</code>, <code>chaos</code>, <code>matrix</code>, <code>cyberpunk</code>, <code>random</code>, <code>clear</code>, <code>god</code>`;
    } else if (cleanCmd === "chaos" || cleanCmd === "make it chaos") {
      triggerChaosMode();
      dom.shellOutput.innerHTML = `CHAOS PROTOCOL ACTIVATED.`;
    } else if (cleanCmd === "matrix") {
      state.theme = "matrix";
      syncUIWithState();
      triggerRender(true);
      dom.shellOutput.innerHTML = `Active theme: Phosphor Green Matrix.`;
    } else if (cleanCmd === "cyberpunk") {
      state.theme = "cyberpunk";
      syncUIWithState();
      triggerRender(true);
      dom.shellOutput.innerHTML = `Active theme: Neon Cyberpunk.`;
    } else if (cleanCmd === "random" || cleanCmd === "surprise") {
      triggerSurpriseMe();
      dom.shellOutput.innerHTML = `Rolling random style...`;
    } else if (cleanCmd === "clear") {
      dom.shellOutput.classList.add("hidden");
    } else if (cleanCmd === "god") {
      unlockGodMode();
    } else {
      dom.shellOutput.innerHTML = `command not found: ${cleanCmd}. Try 'help'.`;
    }
  }

  // 2. Konami Code Listener [↑ ↑ ↓ ↓ ← → ← → B A]
  const konamiSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiIndex = 0;

  window.addEventListener("keydown", (e) => {
    // Check if user is typing in an input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key === konamiSequence[konamiIndex] || e.key.toLowerCase() === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        unlockGodMode();
      }
    } else {
      konamiIndex = 0;
    }

    // Global Shortcuts
    if (e.code === "Space") {
      e.preventDefault();
      triggerSurpriseMe();
    } else if (e.key.toLowerCase() === "c") {
      if (state.lastRenderResult) {
        copyToClipboard(state.lastRenderResult.plain, "✓ Plain Text Copied!");
      }
    } else if (e.key.toLowerCase() === "f") {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === "a") {
      toggleAnimation();
    } else if (e.key.toLowerCase() === "m") {
      toggleSound();
    } else if (e.key.toLowerCase() === "p") {
      rasterizeToPng();
    }
  });

  function unlockGodMode() {
    audio.easterEgg();
    dom.modalEasterEgg.classList.remove("hidden");
    state.style = "braille";
    state.theme = "rainbow";
    state.animFps = 30;
    state.density = 1.4;
    syncUIWithState();
    triggerRender(true);
  }

  function toggleFullscreen() {
    dom.terminalWindow.classList.toggle("fullscreen");
    audio.click();
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    dom.btnSound.classList.toggle("muted", !state.soundEnabled);
    dom.soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
    dom.btnSound.querySelector(".sound-label").textContent = state.soundEnabled ? "FX ON" : "FX OFF";
    showToast(state.soundEnabled ? "Sound Effects ON" : "Sound Effects Muted");
  }

  // =========================================================================
  // 13. EVENT LISTENERS SETUP
  // =========================================================================
  function initEventListeners() {
    // Sound Toggle
    dom.btnSound.addEventListener("click", toggleSound);

    // Surprise Me buttons
    dom.btnNavRandom.addEventListener("click", triggerSurpriseMe);
    dom.btnHeroRandom.addEventListener("click", triggerSurpriseMe);
    dom.btnRandomRoll.addEventListener("click", triggerSurpriseMe);

    // Hero Drop CTA
    dom.btnHeroDrop.addEventListener("click", () => dom.fileInput.click());
    dom.btnNavUpload.addEventListener("click", () => dom.fileInput.click());

    // Try Demo CTA
    dom.btnHeroDemo.addEventListener("click", () => {
      loadSample("portrait");
      document.getElementById("playground").scrollIntoView({ behavior: "smooth" });
    });

    // Starter Cards
    dom.starterCards.forEach(card => {
      card.addEventListener("click", () => {
        loadSample(card.dataset.sample);
        document.getElementById("playground").scrollIntoView({ behavior: "smooth" });
      });
    });

    // File input & Dropzone
    dom.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelected(e.target.files[0]);
      }
    });

    dom.dropzone.addEventListener("click", () => dom.fileInput.click());

    dom.dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dom.dropzone.classList.add("drag-active");
    });

    dom.dropzone.addEventListener("dragleave", () => {
      dom.dropzone.classList.remove("drag-active");
    });

    dom.dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dom.dropzone.classList.remove("drag-active");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    // Paste from clipboard
    window.addEventListener("paste", (e) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        handleFileSelected(e.clipboardData.files[0]);
      }
    });

    // Clear Thumbnail
    dom.btnRemoveImage.addEventListener("click", (e) => {
      e.stopPropagation();
      state.file = null;
      state.imageBase64 = null;
      dom.thumbnailWrapper.classList.add("hidden");
      dom.dropzonePrompt.classList.remove("hidden");
      loadSample("portrait");
    });

    // Presets
    dom.presetsContainer.querySelectorAll(".preset-card").forEach(btn => {
      btn.addEventListener("click", () => {
        dom.presetsContainer.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        state.preset = btn.dataset.preset;
        if (state.preset) {
          // If specific preset selected, let server preset define style/theme
          triggerRender(true);
        } else {
          triggerRender(true);
        }
        audio.click();
      });
    });

    // Renderer Style Radio Tiles
    dom.stylesContainer.querySelectorAll(".renderer-tile").forEach(tile => {
      tile.addEventListener("click", () => {
        dom.stylesContainer.querySelectorAll(".renderer-tile").forEach(t => t.classList.remove("active"));
        tile.classList.add("active");
        state.style = tile.dataset.style;
        state.preset = "";
        triggerRender(true);
        audio.click();
      });
    });

    // Theme Palette Chips
    dom.themesContainer.querySelectorAll(".palette-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        dom.themesContainer.querySelectorAll(".palette-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.theme = chip.dataset.theme;
        state.preset = "";
        triggerRender(true);
        audio.click();
      });
    });

    // Sliders
    dom.sliderWidth.addEventListener("input", (e) => {
      state.width = parseInt(e.target.value, 10);
      dom.valWidth.textContent = state.width;
      triggerRender();
    });

    dom.sliderDensity.addEventListener("input", (e) => {
      state.density = parseFloat(e.target.value);
      dom.valDensity.textContent = `${state.density.toFixed(2)}×`;
      triggerRender();
    });

    // Animation Controls
    dom.animTypeSelect.addEventListener("change", (e) => {
      state.animType = e.target.value;
      if (state.isAnimating) {
        stopAnimation();
        startAnimation();
      }
    });

    dom.sliderFps.addEventListener("input", (e) => {
      state.animFps = parseInt(e.target.value, 10);
      dom.valFps.textContent = `${state.animFps} FPS`;
      if (state.isAnimating) {
        clearInterval(state.animIntervalId);
        const intervalMs = Math.round(1000 / state.animFps);
        state.animIntervalId = setInterval(fetchNextFrame, intervalMs);
      }
    });

    dom.btnToggleAnim.addEventListener("click", toggleAnimation);

    // Advanced Drawer Toggle
    dom.btnToggleAdvanced.addEventListener("click", () => {
      const isExpanded = dom.btnToggleAdvanced.getAttribute("aria-expanded") === "true";
      dom.btnToggleAdvanced.setAttribute("aria-expanded", !isExpanded);
      dom.advancedDrawer.classList.toggle("hidden", isExpanded);
      audio.click();
    });

    // Advanced Sliders
    dom.sliderContrast.addEventListener("input", (e) => {
      state.contrast = parseFloat(e.target.value);
      dom.valContrast.textContent = `${state.contrast.toFixed(2)}×`;
      triggerRender();
    });

    dom.sliderBrightness.addEventListener("input", (e) => {
      state.brightness = parseFloat(e.target.value);
      dom.valBrightness.textContent = `${state.brightness.toFixed(2)}×`;
      triggerRender();
    });

    dom.sliderSharpness.addEventListener("input", (e) => {
      state.sharpness = parseFloat(e.target.value);
      dom.valSharpness.textContent = `${state.sharpness.toFixed(2)}×`;
      triggerRender();
    });

    dom.sliderGamma.addEventListener("input", (e) => {
      state.gamma = parseFloat(e.target.value);
      dom.valGamma.textContent = state.gamma.toFixed(2);
      triggerRender();
    });

    dom.btnResetSliders.addEventListener("click", () => {
      state.contrast = 1.0;
      state.brightness = 1.0;
      state.sharpness = 1.0;
      state.gamma = 1.0;
      state.density = 1.0;
      dom.sliderContrast.value = 1.0;
      dom.valContrast.textContent = "1.00×";
      dom.sliderBrightness.value = 1.0;
      dom.valBrightness.textContent = "1.00×";
      dom.sliderSharpness.value = 1.0;
      dom.valSharpness.textContent = "1.00×";
      dom.sliderGamma.value = 1.0;
      dom.valGamma.textContent = "1.00";
      dom.sliderDensity.value = 1.0;
      dom.valDensity.textContent = "1.00×";
      triggerRender(true);
      showToast("Reset sliders to defaults");
    });

    // Toggles
    dom.checkEdge.addEventListener("change", (e) => {
      state.edgeEnhance = e.target.checked;
      triggerRender(true);
    });

    dom.checkInvert.addEventListener("change", (e) => {
      state.invert = e.target.checked;
      triggerRender(true);
    });

    dom.checkColor.addEventListener("change", (e) => {
      state.color = e.target.checked;
      triggerRender(true);
    });

    dom.checkCrt.addEventListener("change", (e) => {
      state.crt = e.target.checked;
      dom.crtOverlay.classList.toggle("disabled", !state.crt);
    });

    // Font Zoom
    dom.btnFontDown.addEventListener("click", () => {
      state.fontSize = Math.max(6, state.fontSize - 1);
      dom.terminalPre.style.fontSize = `${state.fontSize}px`;
      dom.valFontSize.textContent = `${state.fontSize}px`;
    });

    dom.btnFontUp.addEventListener("click", () => {
      state.fontSize = Math.min(24, state.fontSize + 1);
      dom.terminalPre.style.fontSize = `${state.fontSize}px`;
      dom.valFontSize.textContent = `${state.fontSize}px`;
    });

    // Fullscreen buttons
    dom.btnFullscreen.addEventListener("click", toggleFullscreen);
    dom.btnFullscreenDot.addEventListener("click", toggleFullscreen);

    // Window Close (Clear)
    dom.dotClose.addEventListener("click", () => {
      dom.terminalPre.innerHTML = "";
      showToast("Canvas cleared. Pick a preset or drop an image.");
    });

    // Window Min (Reset Zoom)
    dom.dotMin.addEventListener("click", () => {
      state.fontSize = 11;
      dom.terminalPre.style.fontSize = "11px";
      dom.valFontSize.textContent = "11px";
      showToast("Viewport zoom reset to 11px");
    });

    // Copy Art Main Button -> Opens Copy Modal
    dom.btnCopyMain.addEventListener("click", () => {
      dom.modalCopy.classList.remove("hidden");
      audio.click();
    });

    // Share Modal Open
    dom.btnShareModal.addEventListener("click", () => {
      dom.modalShare.classList.remove("hidden");
      audio.click();
    });

    // Download PNG Action
    dom.btnDownloadPng.addEventListener("click", rasterizeToPng);

    // Copy Modal Close
    dom.btnCloseCopy.addEventListener("click", () => dom.modalCopy.classList.add("hidden"));
    dom.modalCopy.addEventListener("click", (e) => {
      if (e.target === dom.modalCopy) dom.modalCopy.classList.add("hidden");
    });

    // Share Modal Close
    dom.btnCloseShare.addEventListener("click", () => dom.modalShare.classList.add("hidden"));
    dom.modalShare.addEventListener("click", (e) => {
      if (e.target === dom.modalShare) dom.modalShare.classList.add("hidden");
    });

    // Easter Egg Modal Close
    dom.btnDismissEgg.addEventListener("click", () => dom.modalEasterEgg.classList.add("hidden"));

    // Copy Center Actions
    dom.btnCopyPlainAction.addEventListener("click", () => {
      if (!state.lastRenderResult) return;
      copyToClipboard(state.lastRenderResult.plain, "✓ Plain UTF-8 Text Copied!");
      dom.modalCopy.classList.add("hidden");
    });

    dom.btnCopyAnsiAction.addEventListener("click", () => {
      if (!state.lastRenderResult) return;
      copyToClipboard(state.lastRenderResult.ansi, "✓ 24-Bit ANSI Codes Copied!");
      dom.modalCopy.classList.add("hidden");
    });

    dom.btnCopyMdAction.addEventListener("click", () => {
      copyToClipboard(getMarkdownOutput(), "✓ Markdown Code Block Copied!");
      dom.modalCopy.classList.add("hidden");
    });

    dom.btnCopyHtmlAction.addEventListener("click", () => {
      copyToClipboard(getHtmlOutput(), "✓ HTML Spans Copied!");
      dom.modalCopy.classList.add("hidden");
    });

    // Platform Share Actions
    dom.btnShareWhatsappImg.addEventListener("click", () => {
      rasterizeToPng();
      showToast("Tip: Share the downloaded PNG file directly on WhatsApp!");
      dom.modalShare.classList.add("hidden");
    });

    dom.btnShareWhatsappTxt.addEventListener("click", () => {
      if (!state.lastRenderResult) return;
      copyToClipboard("```\n" + state.lastRenderResult.plain + "\n```", "✓ Formatted Text Copied for WhatsApp!");
      dom.modalShare.classList.add("hidden");
    });

    dom.btnShareDiscordMd.addEventListener("click", () => {
      copyToClipboard(getMarkdownOutput(), "✓ Discord Markdown Copied!");
      dom.modalShare.classList.add("hidden");
    });

    dom.btnShareDiscordPng.addEventListener("click", () => {
      rasterizeToPng();
      dom.modalShare.classList.add("hidden");
    });

    dom.btnShareSlackCode.addEventListener("click", () => {
      if (!state.lastRenderResult) return;
      copyToClipboard("```\n" + state.lastRenderResult.plain + "\n```", "✓ Slack Code Block Copied!");
      dom.modalShare.classList.add("hidden");
    });

    dom.btnShareSlackPng.addEventListener("click", () => {
      rasterizeToPng();
      dom.modalShare.classList.add("hidden");
    });

    dom.btnShareXCaption.addEventListener("click", () => {
      const caption = "Turned an image into living terminal art with TermiArt. 🎨✨\nhttps://termiart.app #ASCIIArt #CreativeTech";
      copyToClipboard(caption, "✓ Caption Copied for X / Twitter!");
      dom.modalShare.classList.add("hidden");
    });

    dom.btnShareXIntent.addEventListener("click", () => {
      const text = encodeURIComponent("Turned an image into living terminal art with TermiArt. 🎨✨");
      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    });

    // Direct Modal Downloads
    dom.btnModalDlPng.addEventListener("click", () => {
      rasterizeToPng();
      dom.modalShare.classList.add("hidden");
    });

    dom.btnModalDlTxt.addEventListener("click", () => {
      if (!state.lastRenderResult) return;
      downloadBlob(state.lastRenderResult.plain, "termiart.txt", "text/plain");
      dom.modalShare.classList.add("hidden");
    });

    dom.btnModalDlAns.addEventListener("click", () => {
      if (!state.lastRenderResult) return;
      downloadBlob(state.lastRenderResult.ansi, "termiart.ans", "application/octet-stream");
      dom.modalShare.classList.add("hidden");
    });

    dom.btnModalDlHtml.addEventListener("click", () => {
      downloadBlob(getHtmlOutput(), "termiart.html", "text/html");
      dom.modalShare.classList.add("hidden");
    });

    // Copy CLI command
    dom.btnCopyCli.addEventListener("click", () => {
      copyToClipboard(dom.cliCommandText.textContent, "✓ Terminal CLI command copied!");
    });

    // Shell Form Easter Egg
    dom.shellForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (dom.shellInput.value) {
        handleShellCommand(dom.shellInput.value);
        dom.shellInput.value = "";
      }
    });

    // Chaos Mode Preset
    const btnChaos = document.getElementById("btn-preset-chaos");
    if (btnChaos) {
      btnChaos.addEventListener("click", triggerChaosMode);
    }

    // Explore Specimen Load Buttons
    document.querySelectorAll(".btn-load-specimen").forEach(btn => {
      btn.addEventListener("click", () => {
        const sample = btn.dataset.sample;
        loadSample(sample);
        handleRouteNavigation("/create");
        showToast(`Loaded ${sample.toUpperCase()} specimen`);
      });
    });

    // Client-side Navigation Routing
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("/")) {
          e.preventDefault();
          handleRouteNavigation(href);
        }
      });
    });

    window.addEventListener("popstate", () => {
      handleRouteNavigation(window.location.pathname, false);
    });

    // Logo Glitch
    dom.brandLogo.addEventListener("mouseenter", () => {
      dom.logoGlyph.textContent = "%#";
      dom.logoText.textContent = "T3RM1ART";
      setTimeout(() => {
        dom.logoGlyph.textContent = ">_";
        dom.logoText.textContent = "TERMIART";
      }, 350);
    });
  }

  // =========================================================================
  // 14. ROUTING & CHAOS LOGIC
  // =========================================================================
  function handleRouteNavigation(path, push = true) {
    if (push && window.location.pathname !== path) {
      history.pushState(null, "", path);
    }

    // Highlight nav link
    document.querySelectorAll(".nav-link").forEach(link => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === path);
    });

    if (path === "/create") {
      document.getElementById("playground").scrollIntoView({ behavior: "smooth" });
    } else if (path === "/explore") {
      document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
    } else if (path === "/presets") {
      document.getElementById("presets-section").scrollIntoView({ behavior: "smooth" });
    } else if (path === "/" || path === "") {
      document.getElementById("hero").scrollIntoView({ behavior: "smooth" });
    }
  }

  function triggerChaosMode() {
    audio.easterEgg();
    state.style = allStyles[Math.floor(Math.random() * allStyles.length)];
    state.theme = allThemes[Math.floor(Math.random() * allThemes.length)];
    state.density = +(1.1 + Math.random() * 0.4).toFixed(2);
    state.contrast = +(1.3 + Math.random() * 0.5).toFixed(2);
    state.sharpness = +(1.2 + Math.random() * 0.4).toFixed(2);
    state.crt = true;
    dom.crtOverlay.classList.remove("disabled");
    dom.checkCrt.checked = true;
    syncUIWithState();
    showToast("⚡ CHAOS MODE ACTIVATED!", "success");
    triggerRender(true);
  }

  // =========================================================================
  // 15. INITIAL BOOTSTRAP
  // =========================================================================
  function bootstrap() {
    initEventListeners();
    // Check initial route
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== "/") {
      handleRouteNavigation(currentPath, false);
    }
    // Default load portrait sample
    loadSample("portrait");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();

