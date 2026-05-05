'use client';

import { useEffect, useRef, useState } from 'react';

// Generate the list of frame filenames (009 to 162)
const FRAME_START = 9;
const FRAME_END = 162;
const FRAME_COUNT = FRAME_END - FRAME_START + 1; // 154 frames

function getFramePaths(): string[] {
  const paths: string[] = [];
  for (let i = FRAME_START; i <= FRAME_END; i++) {
    const num = String(i).padStart(3, '0');
    paths.push(`/frame/ezgif-frame-${num}.jpg`);
  }
  return paths;
}

const FRAME_PATHS = getFramePaths();

export default function ScrollAnimationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const currentFrameRef = useRef(0);

  // Load all frames from public/frame/ directory
  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const loaded: HTMLImageElement[] = [];
      let count = 0;

      const batchSize = 10;
      for (let batch = 0; batch < FRAME_PATHS.length; batch += batchSize) {
        const batchPaths = FRAME_PATHS.slice(batch, batch + batchSize);
        const batchPromises = batchPaths.map(
          (path) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                count++;
                if (!cancelled) setLoadingProgress(count);
                resolve(img);
              };
              img.onerror = () => {
                count++;
                if (!cancelled) setLoadingProgress(count);
                resolve(img);
              };
              img.src = path;
            })
        );

        const batchResults = await Promise.all(batchPromises);
        loaded.push(...batchResults);
      }

      if (!cancelled) {
        setImages(loaded);
        setIsLoading(false);
      }
    };

    loadImages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const drawFrame = (frameIndex: number) => {
      if (images[frameIndex] && images[frameIndex].complete && images[frameIndex].naturalWidth > 0) {
        const img = images[frameIndex];
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.naturalWidth / img.naturalHeight;

        let drawWidth, drawHeight, drawX, drawY;
        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgRatio;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgRatio;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrollY(scrollTop);
      const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = Math.min(Math.max(scrollTop / maxScrollTop, 0), 1);
      const frameIndex = Math.min(
        Math.floor(scrollFraction * FRAME_COUNT),
        FRAME_COUNT - 1
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameRef.current);
    };

    handleResize();
    drawFrame(0);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [images]);

  const progressPercent = Math.round((loadingProgress / FRAME_COUNT) * 100);

  return (
    <div className="relative bg-black">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-screen"
        style={{ objectFit: 'cover' }}
      />

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 loading-overlay">
          <div className="text-center">
            <div className="loading-logo-container">
              <h2 className="loading-logo">dholera</h2>
              <div className="loading-logo-glow" />
            </div>

            <p className="loading-subtitle">Loading Experience</p>

            <div className="loading-progress-track">
              <div
                className="loading-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="loading-progress-text">
              {progressPercent}%
            </div>

            <div className="loading-dots">
              <span className="loading-dot" style={{ animationDelay: '0s' }} />
              <span className="loading-dot" style={{ animationDelay: '0.2s' }} />
              <span className="loading-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Animated Text Overlays */}
      {isMounted && !isLoading && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {/* Section 1: Hero */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
            style={{
              opacity: Math.max(0, 1 - (scrollY / (window.innerHeight * 0.4)))
            }}
          >
            <div className="text-center px-8">
              <div className="hero-badge">
                <span>India&apos;s First Smart City</span>
              </div>
              <h1 className="hero-title animate-fade-in">
                Dholera
              </h1>
              <p className="hero-subtitle animate-fade-in-delay">
                Smart City of Tomorrow
              </p>
              <div className="scroll-indicator animate-fade-in-delay">
                <span>Scroll to Explore</span>
                <div className="scroll-arrow" />
              </div>
            </div>
          </div>

          {/* Section 2: Mid Scroll */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
            style={{
              opacity: (() => {
                const start = window.innerHeight * 1.0;
                const peak = window.innerHeight * 2.0;
                const end = window.innerHeight * 3.0;
                if (scrollY < start) return 0;
                if (scrollY > end) return 0;
                if (scrollY < peak) return Math.min(1, (scrollY - start) / (peak - start));
                return Math.max(0, 1 - (scrollY - peak) / (end - peak));
              })()
            }}
          >
            <div className="text-center px-8">
              <h2 className="section-title">
                Experience
              </h2>
              <p className="section-subtitle">
                World-Class Infrastructure
              </p>
              <div className="section-divider" />
              <p className="section-description">
                A thriving ecosystem of innovation, sustainability, and growth
              </p>
            </div>
          </div>

          {/* Section 3: Stats */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
            style={{
              opacity: (() => {
                const start = window.innerHeight * 3.5;
                const peak = window.innerHeight * 4.5;
                const end = window.innerHeight * 5.5;
                if (scrollY < start) return 0;
                if (scrollY > end) return 0;
                if (scrollY < peak) return Math.min(1, (scrollY - start) / (peak - start));
                return Math.max(0, 1 - (scrollY - peak) / (end - peak));
              })()
            }}
          >
            <div className="text-center px-8">
              <h2 className="section-title">
                A Vision
              </h2>
              <p className="section-subtitle">
                Becoming Reality
              </p>
              <div className="stats-row">
                <div className="stat-card">
                  <span className="stat-number">920+</span>
                  <span className="stat-label">Sq. Km Area</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">₹10L</span>
                  <span className="stat-label">Cr Investment</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">2M+</span>
                  <span className="stat-label">Population Target</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Final */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
            style={{
              opacity: (() => {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                const start = maxScroll * 0.75;
                if (scrollY < start) return 0;
                return Math.min(1, (scrollY - start) / (window.innerHeight * 0.5));
              })()
            }}
          >
            <div className="text-center px-8">
              <h2 className="section-title-glow">
                Welcome to
              </h2>
              <p className="section-title-hero">
                The Future
              </p>
              <div className="cta-container">
                <a href="#" className="cta-button pointer-events-auto">
                  Explore Dholera
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: '800vh' }} className="relative z-10" />
    </div>
  );
}
