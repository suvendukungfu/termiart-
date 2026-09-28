/**
 * TermiArt Web Studio — Client-Side Application Controller
 */

(() => {
  "use strict";

  // Application State
  const state = {
    file: null,
    imageBase64: null,
    sampleName: "sample_test.png",
    style: "halfblock",
    theme: "original",
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
    fontSize: 11,
    isAnimating: false,
    animFrame: 0,
    animType: "matrix",
    animFps: 15,
    animIntervalId: null,
    lastRenderResult: null,
  };

  // DOM Element References
  const dom = {
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("file-input"),
    dropzonePrompt: document.getElementById("dropzone-prompt"),
    thumbnailWrapper: document.getElementById("thumbnail-wrapper"),
    imageThumbnail: document.getElementById("image-thumbnail"),
    thumbName: document.getElementById("thumb-name"),
    btnRemoveImage: document.getElementById("btn-remove-image"),

    presetsContainer: document.getElementById("presets-container"),
    stylesContainer: document.getElementById("styles-container"),
    themesContainer: document.getElementById("themes-container"),

    sliderWidth: document.getElementById("slider-width"),
    valWidth: document.getElementById("val-width"),
    sliderContrast: document.getElementById("slider-contrast"),
    valContrast: document.getElementById("val-contrast"),
    sliderBrightness: document.getElementById("slider-brightness"),
    valBrightness: document.getElementById("val-brightness"),
    sliderSharpness: document.getElementById("slider-sharpness"),
    valSharpness: document.getElementById("val-sharpness"),
    sliderGamma: document.getElementById("slider-gamma"),
    valGamma: document.getElementById("val-gamma"),
    sliderDensity: document.getElementById("slider-density"),
    valDensity: document.getElementById("val-density"),
    btnResetSliders: document.getElementById("btn-reset-sliders"),

    checkEdge: document.getElementById("check-edge"),
    checkInvert: document.getElementById("check-invert"),
    checkColor: document.getElementById("check-color"),

    // Animation
    animTypeSelect: document.getElementById("anim-type-select"),
    btnToggleAnim: document.getElementById("btn-toggle-anim"),
    playIcon: document.getElementById("play-icon"),
    pauseIcon: document.getElementById("pause-icon"),
    animBtnLabel: document.getElementById("anim-btn-label"),
    animLiveBadge: document.getElementById("anim-live-badge"),
    sliderFps: document.getElementById("slider-fps"),
    valFps: document.getElementById("val-fps"),

    // Terminal
    terminalWindow: document.getElementById("terminal-window"),
    terminalPre: document.getElementById("terminal-pre"),
    terminalLoader: document.getElementById("terminal-loader"),
    terminalTitleText: document.getElementById("terminal-title-text"),
    telCols: document.getElementById("tel-cols"),
    telRows: document.getElementById("tel-rows"),
    telChars: document.getElementById("tel-chars"),
    telTime: document.getElementById("tel-time"),

    // Action buttons
    btnCopyPlain: document.getElementById("btn-copy-plain"),
    btnCopyAnsi: document.getElementById("btn-copy-ansi"),
    btnCopyHtml: document.getElementById("btn-copy-html"),
    btnDownloadTxt: document.getElementById("btn-download-txt"),
    btnDownloadAns: document.getElementById("btn-download-ans"),
    btnDownloadPng: document.getElementById("btn-download-png"),
    btnFullscreen: document.getElementById("btn-fullscreen"),
    btnFullscreenDot: document.getElementById("btn-fullscreen-dot"),
    btnCopyCli: document.getElementById("btn-copy-cli"),
    cliCommandText: document.getElementById("cli-command-text"),

    // Header buttons
    toggleCrtBtn: document.getElementById("toggle-crt-btn"),
    btnFontDown: document.getElementById("btn-font-down"),
    btnFontUp: document.getElementById("btn-font-up"),
    btnLoadDemo: document.getElementById("btn-load-demo"),
    btnRandomRoll: document.getElementById("btn-random-roll"),

    toastContainer: document.getElementById("toast-container"),
    exportCanvas: document.getElementById("export-canvas"),
  };

  // Toast Notification System
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "success" ? "toast-success" : ""}`;
    toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>${message}</span>
    `;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  // Debounced API Render Trigger
  let renderDebounceTimer = null;
  function scheduleRender(delay = 120) {
    if (state.isAnimating) {
      // Don't interrupt animation loop
      return;
    }
    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(triggerRender, delay);
  }

  async function triggerRender() {
    dom.terminalLoader.classList.remove("hidden");

    const formData = new FormData();
    if (state.file) {
      formData.append("file", state.file);
    } else if (state.imageBase64) {
      formData.append("image_base64", state.imageBase64);
    } else {
      formData.append("sample_name", state.sampleName);
    }

    formData.append("style", state.style);
    formData.append("theme", state.theme);
    if (state.preset) {
      formData.append("preset", state.preset);
    }
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
        const err = await resp.json();
        throw new Error(err.detail || "Render failed");
      }

      const data = await resp.json();
      state.lastRenderResult = data;

      // Update terminal view
      dom.terminalPre.innerHTML = data.html;
      dom.cliCommandText.textContent = data.cli_command;

      // Update telemetry
      dom.telCols.textContent = `Cols: ${data.stats.cols}`;
      dom.telRows.textContent = `Rows: ${data.stats.rows}`;
      dom.telChars.textContent = `Chars: ${data.stats.characters.toLocaleString()}`;
      dom.telTime.textContent = `Time: ${data.stats.render_time_ms} ms`;
      dom.terminalTitleText.textContent = `termiart -s ${data.stats.style} -t ${data.stats.theme} (${data.stats.cols}×${data.stats.rows})`;

    } catch (err) {
      console.error("Render error:", err);
      showToast(`Render failed: ${err.message}`, "error");
    } finally {
      dom.terminalLoader.classList.add("hidden");
    }
  }

  // Preset Definitions Map for Instant UI Update
  const PRESET_MAP = {
    cyberpunk: {
      style: "cyberpunk",
      theme: "cyberpunk",
      contrast: 1.4,
      brightness: 1.1,
      sharpness: 1.4,
      edgeEnhance: false,
    },
    matrix: {
      style: "matrix",
      theme: "matrix",
      contrast: 1.35,
      brightness: 1.05,
      edgeEnhance: true,
    },
    anime: {
      style: "halfblock",
      theme: "anime",
      contrast: 1.25,
      brightness: 1.12,
      sharpness: 1.35,
      edgeEnhance: true,
    },
    fire: {
      style: "dense_ascii",
      theme: "fire",
      contrast: 1.45,
      brightness: 1.1,
      edgeEnhance: false,
    },
    ocean: {
      style: "unicode",
      theme: "ocean",
      contrast: 1.3,
      brightness: 1.05,
      edgeEnhance: false,
    },
    purple_neon: {
      style: "halfblock",
      theme: "purple_neon",
      contrast: 1.35,
      brightness: 1.08,
      edgeEnhance: false,
    },
  };

  function applyPreset(presetKey) {
    state.preset = presetKey;

    // Update preset pills active state
    document.querySelectorAll(".preset-pill").forEach(pill => {
      pill.classList.toggle("active", pill.dataset.preset === presetKey);
    });

    if (presetKey && PRESET_MAP[presetKey]) {
      const p = PRESET_MAP[presetKey];
      state.style = p.style;
      state.theme = p.theme;
      state.contrast = p.contrast ?? 1.0;
      state.brightness = p.brightness ?? 1.0;
      state.sharpness = p.sharpness ?? 1.0;
      state.edgeEnhance = p.edgeEnhance ?? false;

      // Update UI inputs
      syncControlsToState();
    }

    scheduleRender(0);
  }

  function syncControlsToState() {
    // Style radio
    const styleRadio = document.querySelector(`input[name="renderer-style"][value="${state.style}"]`);
    if (styleRadio) {
      styleRadio.checked = true;
      document.querySelectorAll(".style-card").forEach(c => c.classList.remove("active"));
      styleRadio.closest(".style-card")?.classList.add("active");
    }

    // Theme radio
    const themeRadio = document.querySelector(`input[name="color-theme"][value="${state.theme}"]`);
    if (themeRadio) {
      themeRadio.checked = true;
      document.querySelectorAll(".theme-chip").forEach(c => c.classList.remove("active"));
      themeRadio.closest(".theme-chip")?.classList.add("active");
    }

    // Sliders
    dom.sliderWidth.value = state.width;
    dom.valWidth.textContent = state.width;

    dom.sliderContrast.value = state.contrast;
    dom.valContrast.textContent = `${Number(state.contrast).toFixed(2)}×`;

    dom.sliderBrightness.value = state.brightness;
    dom.valBrightness.textContent = `${Number(state.brightness).toFixed(2)}×`;

    dom.sliderSharpness.value = state.sharpness;
    dom.valSharpness.textContent = `${Number(state.sharpness).toFixed(2)}×`;

    dom.sliderGamma.value = state.gamma;
    dom.valGamma.textContent = Number(state.gamma).toFixed(2);

    dom.sliderDensity.value = state.density;
    dom.valDensity.textContent = `${Number(state.density).toFixed(2)}×`;

    // Toggles
    dom.checkEdge.checked = state.edgeEnhance;
    dom.checkInvert.checked = state.invert;
    dom.checkColor.checked = state.color;
  }

  // Setup Event Listeners
  function initEventListeners() {
    // 1. Dropzone & File Upload
    dom.dropzone.addEventListener("click", () => dom.fileInput.click());

    dom.fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleLoadedFile(file);
    });

    dom.dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dom.dropzone.classList.add("dragover");
    });

    dom.dropzone.addEventListener("dragleave", () => {
      dom.dropzone.classList.remove("dragover");
    });

    dom.dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dom.dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleLoadedFile(e.dataTransfer.files[0]);
      }
    });

    // Paste Image from Clipboard
    window.addEventListener("paste", (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          const blob = item.getAsFile();
          handleLoadedFile(blob, "pasted_image.png");
          showToast("Image pasted from clipboard!");
          break;
        }
      }
    });

    dom.btnRemoveImage.addEventListener("click", (e) => {
      e.stopPropagation();
      state.file = null;
      state.imageBase64 = null;
      dom.thumbnailWrapper.classList.add("hidden");
      dom.dropzonePrompt.classList.remove("hidden");
      scheduleRender(0);
    });

    // 2. Presets Click
    dom.presetsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".preset-pill");
      if (btn) {
        applyPreset(btn.dataset.preset);
      }
    });

    // 3. Renderer Style Radio Change
    dom.stylesContainer.addEventListener("change", (e) => {
      if (e.target.name === "renderer-style") {
        state.style = e.target.value;
        state.preset = "";
        document.querySelectorAll(".style-card").forEach(c => c.classList.remove("active"));
        e.target.closest(".style-card")?.classList.add("active");
        document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
        scheduleRender(0);
      }
    });

    // 4. Color Theme Radio Change
    dom.themesContainer.addEventListener("change", (e) => {
      if (e.target.name === "color-theme") {
        state.theme = e.target.value;
        state.preset = "";
        document.querySelectorAll(".theme-chip").forEach(c => c.classList.remove("active"));
        e.target.closest(".theme-chip")?.classList.add("active");
        scheduleRender(0);
      }
    });

    // 5. Sliders Input Events
    dom.sliderWidth.addEventListener("input", (e) => {
      state.width = parseInt(e.target.value, 10);
      dom.valWidth.textContent = state.width;
      scheduleRender(120);
    });

    dom.sliderContrast.addEventListener("input", (e) => {
      state.contrast = parseFloat(e.target.value);
      dom.valContrast.textContent = `${state.contrast.toFixed(2)}×`;
      scheduleRender(120);
    });

    dom.sliderBrightness.addEventListener("input", (e) => {
      state.brightness = parseFloat(e.target.value);
      dom.valBrightness.textContent = `${state.brightness.toFixed(2)}×`;
      scheduleRender(120);
    });

    dom.sliderSharpness.addEventListener("input", (e) => {
      state.sharpness = parseFloat(e.target.value);
      dom.valSharpness.textContent = `${state.sharpness.toFixed(2)}×`;
      scheduleRender(120);
    });

    dom.sliderGamma.addEventListener("input", (e) => {
      state.gamma = parseFloat(e.target.value);
      dom.valGamma.textContent = state.gamma.toFixed(2);
      scheduleRender(120);
    });

    dom.sliderDensity.addEventListener("input", (e) => {
      state.density = parseFloat(e.target.value);
      dom.valDensity.textContent = `${state.density.toFixed(2)}×`;
      scheduleRender(120);
    });

    // Reset Sliders
    dom.btnResetSliders.addEventListener("click", () => {
      state.contrast = 1.0;
      state.brightness = 1.0;
      state.sharpness = 1.0;
      state.gamma = 1.0;
      state.density = 1.0;
      state.edgeEnhance = false;
      state.invert = false;
      syncControlsToState();
      scheduleRender(0);
      showToast("Adjustments reset to default");
    });

    // Toggles
    dom.checkEdge.addEventListener("change", (e) => {
      state.edgeEnhance = e.target.checked;
      scheduleRender(0);
    });

    dom.checkInvert.addEventListener("change", (e) => {
      state.invert = e.target.checked;
      scheduleRender(0);
    });

    dom.checkColor.addEventListener("change", (e) => {
      state.color = e.target.checked;
      scheduleRender(0);
    });

    // 6. Animation Engine Controls
    dom.btnToggleAnim.addEventListener("click", toggleAnimation);

    dom.animTypeSelect.addEventListener("change", (e) => {
      state.animType = e.target.value;
      if (state.isAnimating) {
        state.animFrame = 0;
      }
    });

    dom.sliderFps.addEventListener("input", (e) => {
      state.animFps = parseInt(e.target.value, 10);
      dom.valFps.textContent = `${state.animFps} FPS`;
      if (state.isAnimating) {
        clearInterval(state.animIntervalId);
        startAnimationLoop();
      }
    });

    // 7. Action Bar Clipboard & Downloads
    dom.btnCopyPlain.addEventListener("click", () => {
      if (!state.lastRenderResult?.plain) return;
      navigator.clipboard.writeText(state.lastRenderResult.plain)
        .then(() => showToast("Copied Plain ASCII to Clipboard!"))
        .catch(() => showToast("Copy failed", "error"));
    });

    dom.btnCopyAnsi.addEventListener("click", () => {
      if (!state.lastRenderResult?.ansi) return;
      navigator.clipboard.writeText(state.lastRenderResult.ansi)
        .then(() => showToast("Copied ANSI TrueColor codes to Clipboard!"))
        .catch(() => showToast("Copy failed", "error"));
    });

    dom.btnCopyHtml.addEventListener("click", () => {
      if (!state.lastRenderResult?.html) return;
      navigator.clipboard.writeText(state.lastRenderResult.html)
        .then(() => showToast("Copied HTML markup to Clipboard!"))
        .catch(() => showToast("Copy failed", "error"));
    });

    dom.btnDownloadTxt.addEventListener("click", () => {
      if (!state.lastRenderResult?.plain) return;
      downloadFile(state.lastRenderResult.plain, "termiart_artwork.txt", "text/plain");
      showToast("Downloaded .txt file!");
    });

    dom.btnDownloadAns.addEventListener("click", () => {
      if (!state.lastRenderResult?.ansi) return;
      downloadFile(state.lastRenderResult.ansi, "termiart_artwork.ans", "text/plain");
      showToast("Downloaded .ans ANSI file!");
    });

    dom.btnDownloadPng.addEventListener("click", exportTerminalAsPng);

    dom.btnCopyCli.addEventListener("click", () => {
      const cmd = dom.cliCommandText.textContent;
      navigator.clipboard.writeText(cmd)
        .then(() => showToast("CLI command copied to clipboard!"))
        .catch(() => showToast("Copy failed", "error"));
    });

    // 8. Fullscreen & Font Sizing
    dom.btnFullscreen.addEventListener("click", toggleFullscreen);
    dom.btnFullscreenDot.addEventListener("click", toggleFullscreen);

    dom.btnFontDown.addEventListener("click", () => {
      state.fontSize = Math.max(6, state.fontSize - 1);
      updateTerminalFontSize();
    });

    dom.btnFontUp.addEventListener("click", () => {
      state.fontSize = Math.min(24, state.fontSize + 1);
      updateTerminalFontSize();
    });

    dom.toggleCrtBtn.addEventListener("click", () => {
      document.body.classList.toggle("crt-active");
      dom.toggleCrtBtn.classList.toggle("active");
      showToast(document.body.classList.contains("crt-active") ? "CRT Scanlines Enabled" : "CRT Scanlines Disabled");
    });

    dom.btnLoadDemo.addEventListener("click", () => {
      state.file = null;
      state.imageBase64 = null;
      dom.thumbnailWrapper.classList.add("hidden");
      dom.dropzonePrompt.classList.remove("hidden");
      scheduleRender(0);
      showToast("Demo image loaded!");
    });

    dom.btnRandomRoll.addEventListener("click", rollRandomStyle);

    // Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

      if (e.code === "Space") {
        e.preventDefault();
        toggleAnimation();
      } else if (e.code === "KeyR") {
        rollRandomStyle();
      } else if (e.code === "KeyF") {
        toggleFullscreen();
      } else if (e.code === "Escape" && dom.terminalWindow.classList.contains("fullscreen")) {
        toggleFullscreen();
      }
    });
  }

  function handleLoadedFile(file, overrideName) {
    state.file = file;
    const name = overrideName || file.name || "image.png";
    dom.thumbName.textContent = name;

    const reader = new FileReader();
    reader.onload = (e) => {
      state.imageBase64 = e.target.result;
      dom.imageThumbnail.src = e.target.result;
      dom.dropzonePrompt.classList.add("hidden");
      dom.thumbnailWrapper.classList.remove("hidden");
      scheduleRender(0);
    };
    reader.readAsDataURL(file);
  }

  function updateTerminalFontSize() {
    document.documentElement.style.setProperty("--terminal-font-size", `${state.fontSize}px`);
    showToast(`Font size: ${state.fontSize}px`);
  }

  function toggleFullscreen() {
    const isFull = dom.terminalWindow.classList.toggle("fullscreen");
    dom.btnFullscreen.classList.toggle("active", isFull);
  }

  // Live Animation Loop
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
    dom.btnToggleAnim.classList.add("playing");
    dom.playIcon.classList.add("hidden");
    dom.pauseIcon.classList.remove("hidden");
    dom.animBtnLabel.textContent = "Pause";
    dom.animLiveBadge.textContent = "ANIMATING";
    dom.animLiveBadge.classList.add("playing");

    startAnimationLoop();
    showToast(`Animation started: ${state.animType.toUpperCase()}`);
  }

  function stopAnimation() {
    state.isAnimating = false;
    clearInterval(state.animIntervalId);
    state.animIntervalId = null;

    dom.btnToggleAnim.classList.remove("playing");
    dom.playIcon.classList.remove("hidden");
    dom.pauseIcon.classList.add("hidden");
    dom.animBtnLabel.textContent = "Play";
    dom.animLiveBadge.textContent = "STANDBY";
    dom.animLiveBadge.classList.remove("playing");

    // Re-render static crisp frame
    scheduleRender(0);
  }

  function startAnimationLoop() {
    const intervalMs = Math.round(1000 / state.animFps);
    let inFlight = false;

    state.animIntervalId = setInterval(async () => {
      if (inFlight) return;
      inFlight = true;

      const formData = new FormData();
      formData.append("frame", state.animFrame);
      formData.append("anim_type", state.animType);
      formData.append("style", state.style);
      formData.append("theme", state.theme);
      formData.append("width", state.width);
      formData.append("contrast", state.contrast);
      formData.append("brightness", state.brightness);
      formData.append("sharpness", state.sharpness);
      formData.append("edge_enhance", state.edgeEnhance);
      formData.append("invert", state.invert);

      try {
        const resp = await fetch("/api/animate-frame", {
          method: "POST",
          body: formData,
        });

        if (resp.ok) {
          const data = await resp.json();
          dom.terminalPre.innerHTML = data.html;
          state.animFrame += 1;
        }
      } catch (err) {
        console.error("Animation frame error:", err);
      } finally {
        inFlight = false;
      }
    }, intervalMs);
  }

  // Procedural Random Style Roller
  function rollRandomStyle() {
    const styles = ["halfblock", "dense_ascii", "braille", "matrix", "ascii", "unicode", "cyberpunk"];
    const themes = ["original", "matrix", "cyberpunk", "rainbow", "fire", "ocean", "purple_neon", "monochrome", "anime"];

    state.style = styles[Math.floor(Math.random() * styles.length)];
    state.theme = themes[Math.floor(Math.random() * themes.length)];
    state.contrast = +(1.0 + (Math.random() * 0.7 - 0.2)).toFixed(2);
    state.brightness = +(1.0 + (Math.random() * 0.4 - 0.2)).toFixed(2);
    state.sharpness = +(1.0 + (Math.random() * 0.6 - 0.1)).toFixed(2);
    state.edgeEnhance = Math.random() > 0.6;
    state.preset = "";

    syncControlsToState();
    scheduleRender(0);
    showToast(`🎲 Rolled: ${state.style.toUpperCase()} + ${state.theme.toUpperCase()}`);
  }

  // File Download Helper
  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // High-Resolution PNG Snapshot Rasterization
  function exportTerminalAsPng() {
    const pre = dom.terminalPre;
    if (!pre || !pre.textContent) return;

    showToast("Generating PNG snapshot...");

    const lines = pre.textContent.split("\n");
    const numRows = lines.length;
    const numCols = Math.max(...lines.map(l => l.length));

    const canvas = dom.exportCanvas;
    const ctx = canvas.getContext("2d");

    const charW = Math.max(7, state.fontSize * 0.6);
    const charH = Math.max(10, state.fontSize * 1.0);

    const padding = 24;
    canvas.width = Math.ceil(numCols * charW + padding * 2);
    canvas.height = Math.ceil(numRows * charH + padding * 2);

    // Dark terminal canvas background
    ctx.fillStyle = "#080a0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${state.fontSize}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "top";

    // Walk through child elements to capture color and characters
    let cursorX = padding;
    let cursorY = padding;

    function renderNode(node, defaultColor) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === "\n") {
            cursorX = padding;
            cursorY += charH;
          } else {
            ctx.fillStyle = defaultColor;
            ctx.fillText(char, cursorX, cursorY);
            cursorX += charW;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const color = node.style.color || defaultColor;
        const bg = node.style.backgroundColor;
        if (bg) {
          const textLen = node.textContent.length;
          ctx.fillStyle = bg;
          ctx.fillRect(cursorX, cursorY, textLen * charW, charH);
        }
        for (const child of node.childNodes) {
          renderNode(child, color);
        }
      }
    }

    renderNode(pre, "#ffffff");

    // Download PNG
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "termiart_snapshot.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("PNG snapshot downloaded!");
      }
    }, "image/png");
  }

  // Initialization
  document.addEventListener("DOMContentLoaded", () => {
    initEventListeners();
    syncControlsToState();
    // Trigger initial render with sample image
    triggerRender();
  });
})();
