import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArtPipeline } from './engine/pipeline';
import { RenderOptions, TerminalArtifact, RendererType, ThemeType } from './engine/types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TerminalDisplay } from './components/TerminalDisplay';
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
  const [isRendering, setIsRendering] = useState<boolean>(false);

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
  });

  const fileInputTriggerRef = useRef<HTMLInputElement>(null);

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

  const isInitialMount = useRef(true);

  // Master Render Function
  const runRender = useCallback(async (source: File | Blob | string | null, opts: RenderOptions) => {
    if (!source) return;
    setIsRendering(true);
    try {
      const result = await ArtPipeline.render(source, opts);
      setArtifact(result);
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
    const renderers: RendererType[] = ['halfblock', 'ascii', 'dense_ascii', 'unicode', 'braille', 'matrix'];
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

  if (currentTab === '404') {
    return <Cinematic404 onBackToHome={() => navigateToTab('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col font-sans">
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

      {/* Global Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        onOpenUpload={() => fileInputTriggerRef.current?.click()}
      />

      {/* Route Views */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <Hero
              artifact={artifact}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                  <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
                    TERMIART PLAYGROUND
                  </span>
                </div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
                  Creative Terminal Studio
                </h1>
              </div>

              {/* Quick action bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playShift();
                    handleSurpriseMe();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#141622] hover:bg-[#1d2130] border border-[#272b3c] hover:border-amber-400 text-amber-300 font-mono text-xs font-semibold transition-all active:scale-95"
                >
                  🎲 SURPRISE
                </button>

                <button
                  onClick={() => setIsCopyCenterOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#141622] hover:bg-[#1d2130] border border-[#272b3c] hover:border-[#00ff88] text-[#00ff88] font-mono text-xs font-semibold transition-all active:scale-95"
                >
                  📋 COPY
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#141622] hover:bg-[#1d2130] border border-[#272b3c] hover:border-indigo-400 text-indigo-300 font-mono text-xs font-semibold transition-all active:scale-95"
                >
                  🔗 SHARE
                </button>

                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#00ff88] text-black font-mono text-xs font-bold transition-all hover:bg-[#33ff9f] active:scale-95 shadow-[0_0_15px_rgba(0,255,136,0.25)]"
                >
                  ⬇ EXPORT
                </button>
              </div>
            </div>

            {/* 3-Column Desktop Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image Source & Specimens (3 cols) */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <ImageSourcePanel
                  currentImage={currentImage}
                  imagePreviewUrl={imagePreviewUrl}
                  onSelectImage={handleSelectImage}
                  onTryDemo={handleTryDemo}
                />
              </div>

              {/* Center Column: Dominant Live Terminal Art (6 cols) */}
              <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-4">
                <TerminalDisplay
                  artifact={artifact}
                  isLoading={isRendering}
                  onCopyQuick={() => setIsCopyCenterOpen(true)}
                />
              </div>

              {/* Right Column: Creative Controls (3 cols) */}
              <div className="lg:col-span-3 order-3">
                <CreativeControls
                  options={options}
                  onChangeOptions={setOptions}
                  onGenerate={() => runRender(currentImage, options)}
                  onSurpriseMe={handleSurpriseMe}
                  onOpenCopyCenter={() => setIsCopyCenterOpen(true)}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
                  isRendering={isRendering}
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

      {/* Minimal Footer */}
      <Footer onOpen404={() => navigateToTab('404')} />
    </div>
  );
};
