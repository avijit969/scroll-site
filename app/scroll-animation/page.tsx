'use client';

import { useEffect, useRef, useState } from 'react';

// Add custom animations to globals.css or use inline styles

export default function ScrollAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const frameCount = 960;

    useEffect(() => {
        const loadImages = async () => {
            const imagePromises: Promise<HTMLImageElement>[] = [];

            for (let i = 1; i <= frameCount; i++) {
                const frameNumber = String(i).padStart(6, '0');
                const url = `/frames/frame_${frameNumber}.webp`;

                const promise = new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        setLoadingProgress((prev) => prev + 1);
                        resolve(img);
                    };
                    img.onerror = reject;
                    img.src = url;
                });

                imagePromises.push(promise);
            }

            try {
                const loadedImages = await Promise.all(imagePromises);
                setImages(loadedImages);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading images:', error);
            }
        };

        loadImages();
    }, []);

    useEffect(() => {
        if (!canvasRef.current || images.length === 0) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
            const scrollFraction = scrollTop / maxScrollTop;
            const frameIndex = Math.min(
                Math.floor(scrollFraction * frameCount),
                frameCount - 1
            );

            requestAnimationFrame(() => {
                if (images[frameIndex]) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
                }
            });

            // Trigger re-render for text animations
            setLoadingProgress(prev => prev);
        };

        // Initial render
        if (images[0]) {
            context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [images]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="fixed top-0 left-0 w-full h-screen object-cover"
            />

            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
                    <div className="text-center text-white">
                        <div className="text-2xl mb-4">Loading Frames...</div>
                        <div className="text-xl">{loadingProgress} / {frameCount}</div>
                        <div className="w-64 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${(loadingProgress / frameCount) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Animated Text Overlays */}
            <div className="fixed inset-0 pointer-events-none z-20">
                {/* Section 1: Hero Text */}
                <div
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
                    style={{
                        opacity: Math.max(0, 1 - (document.documentElement.scrollTop / (window.innerHeight * 0.5)))
                    }}
                >
                    <div className="text-center text-white px-8">
                        <h1 className="text-4xl md:text-9xl font-bold mb-6 drop-shadow-2xl animate-fade-in">
                            Scroll Through
                        </h1>
                        <p className="text-2xl md:text-5xl font-light drop-shadow-xl animate-fade-in-delay">
                            The Future
                        </p>
                    </div>
                </div>

                {/* Section 2: Mid Scroll */}
                <div
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
                    style={{
                        opacity: (() => {
                            const scroll = document.documentElement.scrollTop;
                            const start = window.innerHeight * 0.8;
                            const end = window.innerHeight * 2;
                            if (scroll < start) return 0;
                            if (scroll > end) return 0;
                            return Math.min(1, (scroll - start) / (window.innerHeight * 0.3));
                        })()
                    }}
                >
                    <div className="text-center text-white px-8">
                        <h2 className="text-6xl md:text-8xl font-bold mb-4 drop-shadow-2xl">
                            Experience
                        </h2>
                        <p className="text-2xl md:text-4xl font-light drop-shadow-xl">
                            Seamless Animation
                        </p>
                    </div>
                </div>

                {/* Section 3: Final */}
                <div
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
                    style={{
                        opacity: (() => {
                            const scroll = document.documentElement.scrollTop;
                            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                            const start = maxScroll * 0.6;
                            if (scroll < start) return 0;
                            return Math.min(1, (scroll - start) / (window.innerHeight * 0.5));
                        })()
                    }}
                >
                    <div className="text-center text-white px-8">
                        <h2 className="text-6xl md:text-8xl font-bold mb-4 drop-shadow-2xl">
                            Welcome to
                        </h2>
                        <p className="text-3xl md:text-5xl font-light drop-shadow-xl">
                            The New Era
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ height: '500vh' }} className="relative z-10" />
        </div>
    );
}
