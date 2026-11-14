
"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./interactive-image-accordion.module.css";

const accordionItems = [
  {
    title: "Kamar Nyaman",
    image: "/image/kost-standar.jpeg",
  },
  {
    title: "Fasilitas Lengkap",
    image: "/image/fasilitas-crop.png",
    objectPosition: "right center",
  },
  {
    title: "Lingkungan Aman & Nyaman",
    image: "/image/kost-tampak-luar.png",
  },
  {
    title: "WiFi Gratis",
    image: "/image/wifi-crop.png",
    objectPosition: "60% center",
  },
  {
    title: "Kebersihan Terjaga",
    image: "/image/kost-tampak-dalam.png",
  },
];

export default function InteractiveImageAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.accordion}>
      {accordionItems.map((item, index) => {
        const isActive = activeIndex === index;

        return (
          <button
            key={item.title}
            type="button"
            className={`${styles.panel} ${
              isActive ? styles.active : ""
            }`}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
            aria-label={item.title}
            aria-pressed={isActive}
          >
            <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 600px) 100vw, 60vw"
                className={styles.panelImage}
                style={{
                    objectPosition: item.objectPosition || "center",
                }}
            />

            <span className={styles.panelOverlay} />

            <span className={styles.panelNumber}>
              0{index + 1}
            </span>

            <span className={styles.panelTitle}>
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
