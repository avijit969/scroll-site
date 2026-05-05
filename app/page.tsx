'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Generate the list of frame filenames (001 to 154)
const FRAME_START = 1;
const FRAME_END = 154;
const FRAME_COUNT = FRAME_END - FRAME_START + 1; // 154 frames

// Frame 70 is at index 69 (0-based)
const TARGET_FRAME = 70;

function getFramePaths(): string[] {
  const paths: string[] = [];
  for (let i = FRAME_START; i <= FRAME_END; i++) {
    const num = String(i).padStart(3, '0');
    paths.push(`/frame/ezgif-frame-${num}.jpg`);
  }
  return paths;
}

const FRAME_PATHS = getFramePaths();

export default function ScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const currentFrameRef = useRef(0);

  // Load all frames from public/frame/ directory
  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const loaded: HTMLImageElement[] = [];
      let count = 0;

      // Load images in batches for better performance
      const batchSize = 10;
      for (let batch = 0; batch < FRAME_PATHS.length; batch += batchSize) {
        const batchPaths = FRAME_PATHS.slice(batch, batch + batchSize);
        const batchPromises = batchPaths.map(
          (path) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new window.Image();
              img.onload = () => {
                count++;
                if (!cancelled) setLoadingProgress(count);
                resolve(img);
              };
              img.onerror = () => {
                count++;
                if (!cancelled) setLoadingProgress(count);
                // Resolve with a blank image on error to not break the sequence
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

  // Canvas rendering on scroll
  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const drawFrame = (frameIndex: number) => {
      if (images[frameIndex] && images[frameIndex].complete && images[frameIndex].naturalWidth > 0) {
        // Scale to cover the canvas while maintaining aspect ratio
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
      const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = Math.min(Math.max(scrollTop / maxScrollTop, 0), 1);
      const frameIndex = Math.min(
        Math.floor(scrollFraction * FRAME_COUNT),
        FRAME_COUNT - 1
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        setCurrentFrame(frameIndex);
        requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };

    // Resize canvas to match window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameRef.current);
    };

    handleResize();

    // Initial render
    drawFrame(0);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [images]);

  const progressPercent = Math.round((loadingProgress / FRAME_COUNT) * 100);

  // Calculate opacity for frame 70+ text overlay
  // Fade in over 8 frames starting at frame 70, then stay fully visible to the end
  const getFrame70Opacity = () => {
    const startIndex = TARGET_FRAME - 1; // frame 70 → index 69
    const fadeInRange = 8;

    if (currentFrame < startIndex) return 0;
    if (currentFrame <= startIndex + fadeInRange) {
      return (currentFrame - startIndex) / fadeInRange;
    }
    return 1; // fully visible from frame 78 onwards
  };

  return (
    <div className="relative bg-black">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-screen"
        style={{ objectFit: 'cover' }}
      />

      {/* Loading Screen - Aurya Logo */}
      {isLoading && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 loading-overlay"
          style={{
            backgroundImage: 'url(/frame/ezgif-frame-001.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="text-center">
            {/* Aurya Logo */}
            <div className="loading-logo-container">
              <Image
                src="/Aurya logo.png"
                alt="Aurya Logo"
                width={280}
                height={280}
                className="aurya-loading-logo"
                priority
              />
              <div className="loading-logo-glow" />
            </div>

            {/* Progress Bar */}
            {/* <div className="loading-progress-track">
              <div
                className="loading-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div> */}

            {/* <div className="loading-progress-text">
              {progressPercent}%
            </div> */}

            {/* Animated dots */}
            {/* <div className="loading-dots">
              <span className="loading-dot" style={{ animationDelay: '0s' }} />
              <span className="loading-dot" style={{ animationDelay: '0.2s' }} />
              <span className="loading-dot" style={{ animationDelay: '0.4s' }} />
            </div> */}
          </div>
        </div>
      )}

      {/* Overlays */}
      {isMounted && !isLoading && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {/* Initial Screen: Scroll Down Arrow Only */}
          <div
            className="absolute inset-0 flex items-end justify-center pb-16 transition-opacity duration-700"
            style={{
              opacity: currentFrame <= 3 ? 1 : 0,
            }}
          >
            <div className="scroll-indicator animate-fade-in">
              <div className="scroll-mouse">
                <div className="scroll-mouse-wheel" />
              </div>
              <div className="scroll-chevrons">
                <div className="scroll-chevron" />
                <div className="scroll-chevron" />
                <div className="scroll-chevron" />
              </div>
            </div>
          </div>

          {/* Frame 70 → Last Frame: "Aurya City - Premium Residential Plots in Dholera" */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
            style={{
              opacity: getFrame70Opacity(),
            }}
          >
            <div className="text-center px-8">
              <h1 className="aurya-title">
                Aurya City
              </h1>
              <div className="aurya-divider" />
              <p className="aurya-tagline">
                Premium Residential Plots in Dholera
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scroll height container - provides the scrollable area */}
      <div style={{ height: '800vh' }} className="relative z-10" />
    </div>
  );
}
