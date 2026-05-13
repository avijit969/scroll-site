"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    Heart,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    Globe,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const jackets = [
    {
        image: "/Jacket-1.png",
        bg: "#151515",
        gradient: "radial-gradient(ellipse 70% 80% at 50% 60%, #2c2c2c 0%, #151515 70%)",
        price: "$149",
        oldPrice: "$199",
        label: "Midnight Black",
    },
    {
        image: "/Jacket-2.png",
        bg: "#c85c08",
        gradient: "radial-gradient(ellipse 70% 80% at 50% 60%, #ff8c1a 0%, #c85c08 70%)",
        price: "$159",
        oldPrice: "$219",
        label: "Burnt Orange",
    },
    {
        image: "/Jacket-3.png",
        bg: "#3a2a20",
        gradient: "radial-gradient(ellipse 70% 80% at 50% 60%, #6b4b3a 0%, #3a2a20 70%)",
        price: "$139",
        oldPrice: "$189",
        label: "Earth Brown",
    },
];

const SCROLL_PER_JACKET = 1; // 1x viewport height per jacket

export default function Page() {
    const heroRef = useRef<HTMLDivElement | null>(null);
    const jacketImgRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeIndexRef = useRef(0);

    useEffect(() => {
        const hero = heroRef.current;
        const jacketEl = jacketImgRef.current;
        if (!hero || !jacketEl) return;

        const vh = window.innerHeight;

        // Hero is CSS position:fixed — we use document.body as scroll trigger.
        // The main element has paddingTop: 100vh so the scroll space starts at scrollY = vh.
        // Per-jacket reveal: scrub from bottom-right-small → center-normal
        // For each jacket segment:
        //   progress 0 → 0.5: current jacket EXITS (scale down, moves bottom-right, fades out)
        //   progress 0.5 → 1: next jacket ENTERS (from bottom-right small → center full)
        jackets.forEach((_jacket, index) => {
            // Each segment starts after the 100vh hero offset
            const startScroll = vh + index * vh * SCROLL_PER_JACKET;
            const endScroll   = startScroll + vh * SCROLL_PER_JACKET;
            const nextIndex   = Math.min(index + 1, jackets.length - 1);

            ScrollTrigger.create({
                trigger: document.body,
                start: startScroll,
                end: endScroll,
                scrub: 1.4,
                onUpdate: (self) => {
                    const progress = self.progress;

                    if (progress < 0.5) {
                        // ── EXIT current jacket ──
                        // t goes 0 → 1 as progress goes 0 → 0.5
                        const t = progress * 2;
                        const eased = t * t; // ease-in

                        // Update active jacket to current
                        if (activeIndexRef.current !== index) {
                            activeIndexRef.current = index;
                            setActiveIndex(index);
                        }

                        // Exit: scale down + drift to bottom-right + fade
                        gsap.set(jacketEl, {
                            x: eased * 300,
                            y: eased * 250,
                            scale: 1 - eased * 0.5,
                            opacity: 1 - eased,
                        });

                        gsap.set(hero, { background: jackets[index].gradient });

                    } else {
                        // ── ENTER next jacket ──
                        // t goes 0 → 1 as progress goes 0.5 → 1
                        const t = (progress - 0.5) * 2;
                        const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic

                        // Update active jacket to next
                        if (activeIndexRef.current !== nextIndex) {
                            activeIndexRef.current = nextIndex;
                            setActiveIndex(nextIndex);
                        }

                        // Enter from bottom-right small → center full
                        gsap.set(jacketEl, {
                            x: (1 - eased) * 380,
                            y: (1 - eased) * 320,
                            scale: 0.15 + eased * 0.85,
                            opacity: Math.min(eased * 2, 1),
                        });

                        gsap.set(hero, { background: jackets[nextIndex].gradient });
                    }
                },
                onEnter: () => {
                    // start of segment: jacket is at rest (index)
                    if (activeIndexRef.current !== index) {
                        activeIndexRef.current = index;
                        setActiveIndex(index);
                    }
                    gsap.set(jacketEl, { x: 0, y: 0, scale: 1, opacity: 1 });
                    gsap.set(hero, { background: jackets[index].gradient });
                },
                onEnterBack: () => {
                    // scrolling back: re-show current index jacket
                    if (activeIndexRef.current !== index) {
                        activeIndexRef.current = index;
                        setActiveIndex(index);
                    }
                    gsap.set(jacketEl, { x: 0, y: 0, scale: 1, opacity: 1 });
                    gsap.set(hero, { background: jackets[index].gradient });
                },
            });
        });

        // Initial state – first jacket centered, full size
        gsap.set(jacketEl, { x: 0, y: 0, scale: 1, opacity: 1 });
        gsap.set(hero, { background: jackets[0].gradient });

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    const active = jackets[activeIndex];

    return (
        <main style={{ background: "#111", paddingTop: "100vh" }}>
            {/* FIXED HERO */}
            <section
                ref={heroRef}
                className="h-screen overflow-hidden"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    zIndex: 10,
                    background: jackets[0].gradient,
                }}
            >
                {/* ── NAVBAR ── */}
                <header className="absolute top-0 left-0 w-full z-50 px-10 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            style={{
                                width: 36, height: 36,
                                background: "white", color: "black",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700, fontSize: 13,
                            }}
                        >
                            JM
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 300, letterSpacing: "0.18em", color: "white" }}>
                            JACKET MASTERS
                        </span>
                    </div>

                    <nav
                        style={{
                            background: "rgba(0,0,0,0.55)",
                            backdropFilter: "blur(20px)",
                            borderRadius: 999,
                            padding: "14px 36px",
                            display: "flex",
                            gap: 36,
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "white",
                            fontSize: 15,
                            letterSpacing: "0.08em",
                        }}
                    >
                        <button
                            style={{
                                background: "white", color: "black",
                                borderRadius: 999, padding: "8px 20px",
                                fontWeight: 600, fontSize: 14,
                            }}
                        >
                            PUFFER JACKET
                        </button>
                        <button style={{ color: "white", opacity: 0.8 }}>ALL PRODUCTS</button>
                        <button style={{ color: "white", opacity: 0.8 }}>ABOUT US</button>
                        <button style={{ color: "white", opacity: 0.8 }}>CONTACT</button>
                    </nav>

                    <div style={{ display: "flex", gap: 12 }}>
                        {[ShoppingCart, Heart].map((Icon, i) => (
                            <button
                                key={i}
                                style={{
                                    width: 46, height: 46, borderRadius: "50%",
                                    background: "rgba(0,0,0,0.45)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "white", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <Icon size={18} />
                            </button>
                        ))}
                    </div>
                </header>

                {/* ── MAIN CONTENT ── */}
                <div
                    ref={contentRef}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        height: "100%",
                        paddingTop: 120,
                        paddingLeft: 48,
                        paddingRight: 48,
                    }}
                >
                    {/* LEFT */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", color: "white" }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
                            {[ChevronLeft, ChevronRight].map((Icon, i) => (
                                <button
                                    key={i}
                                    style={{
                                        width: 52, height: 52, borderRadius: "50%",
                                        background: "rgba(0,0,0,0.4)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        color: "white", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                    }}
                                >
                                    <Icon size={22} />
                                </button>
                            ))}
                        </div>

                        <h1
                            style={{
                                fontSize: "clamp(52px, 6vw, 88px)",
                                fontWeight: 800,
                                lineHeight: 0.95,
                                letterSpacing: "-0.02em",
                                color: "white",
                                margin: 0,
                            }}
                        >
                            Stand out
                            <br />
                            Without trying
                        </h1>

                        <p
                            style={{
                                marginTop: 28,
                                fontSize: 17,
                                lineHeight: 1.7,
                                color: "rgba(255,255,255,0.75)",
                                maxWidth: 360,
                            }}
                        >
                            It&apos;s not just about staying warm. It&apos;s about stepping outside
                            and instantly feeling confident, comfortable, and completely yourself.
                            Designed to elevate even the simplest outfit, this jacket wraps you in
                            lightweight warmth.
                        </p>

                        <button
                            style={{
                                marginTop: 36,
                                background: "white",
                                color: "black",
                                borderRadius: 999,
                                padding: "16px 32px",
                                fontWeight: 600,
                                fontSize: 17,
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                width: "fit-content",
                                cursor: "pointer",
                                transition: "transform 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            Get the look <ChevronRight size={18} />
                        </button>

                        <div style={{ display: "flex", gap: 24, marginTop: 56, color: "white", opacity: 0.75 }}>
                            <FacebookIcon />
                            <Globe size={26} />
                            <span style={{ fontSize: 26, fontWeight: 300 }}>Be</span>
                        </div>
                    </div>

                    {/* CENTER – Jacket (animated via ref) */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                        }}
                    >
                        <div
                            ref={jacketImgRef}
                            style={{
                                position: "relative",
                                width: "clamp(320px, 32vw, 520px)",
                                height: "clamp(440px, 44vw, 720px)",
                                transformOrigin: "center bottom",
                            }}
                        >
                            <Image
                                key={active.image}
                                src={active.image}
                                alt={active.label}
                                fill
                                priority
                                style={{
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 60px 80px rgba(0,0,0,0.6))",
                                }}
                            />
                        </div>

                        <div
                            style={{
                                position: "absolute",
                                bottom: 40,
                                textAlign: "center",
                                color: "white",
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: "clamp(28px, 3.5vw, 46px)",
                                    fontWeight: 400,
                                    lineHeight: 1.2,
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                Confidence,
                                <br />
                                wrapped in warmth
                            </h2>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "center",
                            paddingRight: 16,
                            color: "white",
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <div
                                style={{
                                    fontSize: "clamp(52px, 6vw, 88px)",
                                    fontWeight: 300,
                                    lineHeight: 1,
                                    transition: "all 0.4s ease",
                                }}
                            >
                                {active.price}
                            </div>
                            <div
                                style={{
                                    fontSize: "clamp(36px, 4.5vw, 64px)",
                                    color: "rgba(255,255,255,0.4)",
                                    textDecoration: "line-through",
                                    marginTop: 8,
                                    transition: "all 0.4s ease",
                                }}
                            >
                                {active.oldPrice}
                            </div>
                        </div>

                        <div style={{ marginTop: 48 }}>
                            <p style={{ fontSize: 20, marginBottom: 20, opacity: 0.9 }}>
                                Choose your size:
                            </p>
                            <div style={{ display: "flex", gap: 16 }}>
                                {["36", "38", "40"].map((size, i) => (
                                    <button
                                        key={size}
                                        style={{
                                            width: 68,
                                            height: 68,
                                            borderRadius: "50%",
                                            background: i === 0 ? "white" : "rgba(0,0,0,0.4)",
                                            color: i === 0 ? "black" : "white",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            fontSize: 22,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            transition: "transform 0.2s",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.transform = "scale(1.1)")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.transform = "scale(1)")
                                        }
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Thumbnail strip */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 60 }}>
                            {jackets.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    style={{
                                        position: "relative",
                                        width: 88,
                                        height: 110,
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        opacity: activeIndex === index ? 1 : 0.45,
                                        transform: activeIndex === index ? "scale(1.12)" : "scale(1)",
                                        transition: "all 0.3s ease",
                                        background: "rgba(255,255,255,0.05)",
                                        border: activeIndex === index
                                            ? "2px solid rgba(255,255,255,0.6)"
                                            : "2px solid transparent",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.label}
                                        fill
                                        style={{ objectFit: "contain" }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 32,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 12,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                    }}
                >
                    <span>Scroll</span>
                    <div
                        style={{
                            width: 1,
                            height: 40,
                            background: "rgba(255,255,255,0.3)",
                            animation: "scrollPulse 1.8s ease-in-out infinite",
                        }}
                    />
                    <style>{`
                        @keyframes scrollPulse {
                            0%, 100% { opacity: 0.3; transform: scaleY(1); }
                            50% { opacity: 1; transform: scaleY(1.4); }
                        }
                    `}</style>
                </div>

                {/* Jacket label pill */}
                <div
                    style={{
                        position: "absolute",
                        top: 100,
                        right: 48,
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 999,
                        padding: "8px 20px",
                        color: "white",
                        fontSize: 14,
                        letterSpacing: "0.1em",
                        transition: "all 0.4s ease",
                    }}
                >
                    {active.label}
                </div>
            </section>

            {/* Scroll space – must match total scroll */}
            <section
                style={{
                    height: `${jackets.length * SCROLL_PER_JACKET * 100}vh`,
                    background: "#111",
                }}
            />
        </main>
    );
}

function FacebookIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2V11H8v3h2.4v8h3.1z" />
        </svg>
    );
}