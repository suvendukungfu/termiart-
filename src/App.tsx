import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArtPipeline } from './engine/pipeline';
import { TerminalAnimator } from './engine/animator';
import { RenderOptions, TerminalArtifact, RendererType, ThemeType } from './engine/types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TerminalDisplay, TerminalDisplayHandle } from './components/TerminalDisplay';
import { CreativeControls } from './components/CreativeControls';
import { ImageSourcePanel } from './components/ImageSourcePanel';
import { HowItWorks } from './components/HowItWorks';
import { ExploreGallery } from './components/ExploreGallery';
import { PresetsSection } from './components/PresetsSection';
import { CopyCenterModal } from './components/CopyCenterModal';
import { ShareModal } from './components/ShareModal';
import { DownloadModal } from './components/DownloadModal';
import { Cinematic404 } from './components/Cinematic404';
import { Footer } from './components/Footer';
import { sound } from './utils/audio';

type AppTab = 'home' | 'create' | 'explore' | 'presets' | '404';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [currentImage, setCurrentImage] = useState<File | Blob | string | null>('/samples/anime.png');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>('/samples/anime.png');
  const [artifact, setArtifact] = useState<TerminalArtifact | null>(null);
  const [animatedArtifact, setAnimatedArtifact] = useState<TerminalArtifact | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Modal states
  const [isCopyCenterOpen, setIsCopyCenterOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // Creative settings
  const [options, setOptions] = useState<RenderOptions>({
    width: 90,
    renderer: 'halfblock',
    theme: 'cyberpunk',
    contrast: 1.15,
    brightness: 0.02,
    sharpness: 0.15,
    gamma: 1.0,
    edgeDetect: false,
    invert: false,
    animation: 'matrix',
  });

  const fileInputTriggerRef = useRef<HTMLInputElement>(null);
  const terminalDisplayRef = useRef<TerminalDisplayHandle>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const animCounterRef = useRef<number>(0);
  const isInitialMount = useRef(true);

  // Synchronize browser URL routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'create' || path === 'explore' || path === 'presets' || path === '404') {
        setCurrentTab(path);
      } else {
        setCurrentTab('home');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToTab = (tab: AppTab) => {
    setCurrentTab(tab);
    const targetUrl = tab === 'home' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Master Render Function
  const runRender = useCallback(async (source: File | Blob | string | null, opts: RenderOptions) => {
    if (!source) return;
    setIsRendering(true);
    try {
      const result = await ArtPipeline.render(source, opts);
      setArtifact(result);
      setAnimatedArtifact(null);
    } catch (err) {
      console.error('Rendering error:', err);
    } finally {
      setIsRendering(false);
    }
  }, []);

  // Run render on mount and on options/image change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (currentImage) {
        runRender(currentImage, options);
      }
      return;
    }

    const timer = setTimeout(() => {
      if (currentImage) {
        runRender(currentImage, options);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [options, currentImage, runRender]);

  // Real-time animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isAnimating || !artifact) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      setAnimatedArtifact(null);
      return;
    }

    let lastTime = performance.now();
    const fpsInterval = 1000 / 18; // 18 fps for fluid terminal motion

    const loop = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(loop);
      const delta = currentTime - lastTime;
      if (delta >= fpsInterval) {
        lastTime = currentTime - (delta % fpsInterval);
        animCounterRef.current += 1;
        setAnimatedArtifact((prev) => {
          if (!artifact) return prev;
          return TerminalAnimator.animateFrame(
            artifact,
            options.animation || 'matrix',
            animCounterRef.current
          );
        });
      }
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isAnimating, artifact, options.animation]);

  // Handle image selection
  const handleSelectImage = (source: File | string) => {
    setCurrentImage(source);
    if (typeof source === 'string') {
      setImagePreviewUrl(source);
    } else {
      const url = URL.createObjectURL(source);
      setImagePreviewUrl(url);
    }
    runRender(source, options);
    sound.playGenerate();
  };

  // Try demo specimen
  const handleTryDemo = () => {
    const sampleList = [
      { path: '/samples/anime.png', renderer: 'halfblock' as RendererType, theme: 'cyberpunk' as ThemeType },
      { path: '/samples/portrait.png', renderer: 'dense_ascii' as RendererType, theme: 'original' as ThemeType },
      { path: '/samples/landscape.png', renderer: 'halfblock' as RendererType, theme: 'fire' as ThemeType },
      { path: '/samples/architecture.png', renderer: 'matrix' as RendererType, theme: 'matrix' as ThemeType },
      { path: '/samples/animals.png', renderer: 'braille' as RendererType, theme: 'ocean' as ThemeType },
      { path: '/samples/logo.png', renderer: 'rgb' as RendererType, theme: 'rainbow' as ThemeType },
    ];
    const picked = sampleList[Math.floor(Math.random() * sampleList.length)];
    const newOpts: RenderOptions = {
      ...options,
      renderer: picked.renderer,
      theme: picked.theme,
    };
    setOptions(newOpts);
    handleSelectImage(picked.path);
  };

  // "Surprise Me" signature randomizer
  const handleSurpriseMe = () => {
    const renderers: RendererType[] = [
      'halfblock',
      'ascii',
      'dense_ascii',
      'unicode',
      'braille',
      'matrix',
      'rgb',
    ];
    const themes: ThemeType[] = [
      'original',
      'cyberpunk',
      'matrix',
      'fire',
      'ocean',
      'purple_neon',
      'rainbow',
      'anime',
      'mono',
      'random',
    ];

    const randomRenderer = renderers[Math.floor(Math.random() * renderers.length)];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomWidth = Math.floor(Math.random() * 8) * 10 + 60; // 60, 70, 80, 90, 100, 110, 120, 130
    const randomContrast = Math.round((Math.random() * 0.8 + 0.8) * 10) / 10; // 0.8 - 1.6
    const randomBrightness = Math.round((Math.random() * 0.4 - 0.2) * 10) / 10;

    const newOpts: RenderOptions = {
      ...options,
      renderer: randomRenderer,
      theme: randomTheme,
      width: randomWidth,
      contrast: randomContrast,
      brightness: randomBrightness,
      edgeDetect: Math.random() > 0.85,
      invert: false,
    };

    setOptions(newOpts);
    runRender(currentImage, newOpts);
    sound.playGenerate();
  };

  // Apply preset recipe
  const handleApplyPreset = (presetOpts: Partial<RenderOptions>) => {
    const merged = { ...options, ...presetOpts };
    setOptions(merged);
    navigateToTab('create');
    runRender(currentImage, merged);
  };

  // Load specimen from Explore page
  const handleSelectSampleFromExplore = (path: string, renderer: RendererType, theme: ThemeType) => {
    const newOpts: RenderOptions = {
      ...options,
      renderer,
      theme,
    };
    setOptions(newOpts);
    handleSelectImage(path);
    navigateToTab('create');
  };

  const activeDisplayArtifact = animatedArtifact || artifact;

  if (currentTab === '404') {
    return <Cinematic404 onBackToHome={() => navigateToTab('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans selection:bg-[#00ff88]/30 selection:text-[#00ff88]">
      {/* Hidden file input for global "Drop Image" trigger */}
      <input
        ref={fileInputTriggerRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleSelectImage(e.target.files[0]);
            navigateToTab('create');
          }
        }}
      />

      {/* Global Minimal Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        onRandomize={handleSurpriseMe}
      />

      {/* Route Views */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <Hero
              artifact={activeDisplayArtifact}
              isLoading={isRendering}
              onDropImageClick={() => fileInputTriggerRef.current?.click()}
              onSurpriseMe={handleSurpriseMe}
              onTryDemo={handleTryDemo}
              onOpenStudio={() => navigateToTab('create')}
              onCopyQuick={() => setIsCopyCenterOpen(true)}
            />

            <HowItWorks />

            <ExploreGallery onSelectSample={handleSelectSampleFromExplore} />

            <PresetsSection onApplyPreset={handleApplyPreset} />
          </>
        )}

        {currentTab === 'create' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                  <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-widest">
                    DIGITAL INSTRUMENT
                  </span>
                </div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
                  Creative Terminal Studio
                </h1>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                <span className="px-2.5 py-1 rounded-lg bg-[#0e1017] border border-[#1f232e]">
                  STAGE: {options.renderer.toUpperCase()}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#0e1017] border border-[#1f232e] text-cyan-400">
                  {options.theme.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Desktop: SOURCE IMAGE (Left) beside TERMINAL ART (Right dominant) */}
            {/* Mobile: SOURCE -> TERMINAL ART -> CONTROLS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Source Panel (4 cols on desktop) */}
              <div className="lg:col-span-4 order-1">
                <ImageSourcePanel
                  currentImage={currentImage}
                  imagePreviewUrl={imagePreviewUrl}
                  onSelectImage={handleSelectImage}
                  onTryDemo={handleTryDemo}
                />
              </div>

              {/* Dominant Live Terminal Art Canvas (8 cols on desktop) */}
              <div className="lg:col-span-8 order-2">
                <TerminalDisplay
                  ref={terminalDisplayRef}
                  artifact={activeDisplayArtifact}
                  isLoading={isRendering}
                  onCopyQuick={() => setIsCopyCenterOpen(true)}
                  isAnimating={isAnimating}
                  animationType={options.animation || 'matrix'}
                />
              </div>

              {/* Instrument Creative Controls: full width below source & canvas */}
              <div className="lg:col-span-12 order-3">
                <CreativeControls
                  options={options}
                  onChangeOptions={setOptions}
                  onGenerate={() => runRender(currentImage, options)}
                  onSurpriseMe={handleSurpriseMe}
                  onOpenCopyCenter={() => setIsCopyCenterOpen(true)}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
                  onToggleFullscreen={() => terminalDisplayRef.current?.toggleFullscreen()}
                  isRendering={isRendering}
                  isAnimating={isAnimating}
                  onToggleAnimate={() => setIsAnimating(!isAnimating)}
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === 'explore' && (
          <div className="pt-4">
            <ExploreGallery onSelectSample={handleSelectSampleFromExplore} />
          </div>
        )}

        {currentTab === 'presets' && (
          <div className="pt-4">
            <PresetsSection onApplyPreset={handleApplyPreset} />
          </div>
        )}
      </main>

      {/* Global Modals */}
      <CopyCenterModal
        isOpen={isCopyCenterOpen}
        onClose={() => setIsCopyCenterOpen(false)}
        artifact={artifact}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        artifact={artifact}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        artifact={artifact}
      />

      {/* Minimal Technical Footer */}
      <Footer onOpen404={() => navigateToTab('404')} />
    </div>
  );
};
