"use client";

import { animate, stagger } from "animejs";

/**
 * Animasi transisi horizontal halus & profesional untuk pertukaran konten antar langkah (Stepper)
 * Durasi singkat (220ms), pergeseran mikro (12px), tanpa efek bouncing berlebihan.
 */
export function animateStepTransition(
  target: HTMLElement | string,
  direction: "forward" | "backward" = "forward",
  onComplete?: () => void
) {
  if (typeof window === "undefined" || !target) return;

  const startX = direction === "forward" ? 14 : -14;

  animate(target, {
    opacity: [0.3, 1],
    translateX: [startX, 0],
    duration: 220,
    ease: "outQuad",
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });
}

/**
 * Animasi penghitungan angka presisi & tenang (derajat bearing, koordinat, persentase)
 */
export function animateNumber(
  objHolder: { value: number },
  targetValue: number,
  onUpdate: (val: number) => void,
  duration = 350
) {
  if (typeof window === "undefined") return;

  animate(objHolder, {
    value: targetValue,
    duration: duration,
    ease: "outQuad",
    onUpdate: () => {
      onUpdate(objHolder.value);
    },
  });
}

/**
 * Animasi rotasi presisi jarum kompas atau indikator arah Kaja (Gunung Agung)
 */
export function animateRotation(
  target: HTMLElement | string,
  targetDegrees: number,
  duration = 300
) {
  if (typeof window === "undefined" || !target) return;

  animate(target, {
    rotate: targetDegrees,
    duration: duration,
    ease: "outQuad",
  });
}

/**
 * Animasi sorotan reticle / kartu isu saat ruangan dipilih
 * Presisi dan tidak mengganggu (subtle border flash)
 */
export function animateHighlightPulse(target: HTMLElement | string) {
  if (typeof window === "undefined" || !target) return;

  animate(target, {
    scale: [1, 1.01, 1],
    borderColor: ["#EDE7DA", "#D2603F", "rgba(42, 38, 34, 0.8)"],
    duration: 400,
    ease: "outQuad",
  });
}

/**
 * Animasi stagger kemunculan daftar kartu atau elemen ruangan
 */
export function animateStaggerFadeIn(
  targets: HTMLElement[] | NodeListOf<Element> | string,
  delayBetween = 25
) {
  if (typeof window === "undefined" || !targets) return;

  animate(targets, {
    opacity: [0, 1],
    translateY: [8, 0],
    delay: stagger(delayBetween),
    duration: 200,
    ease: "outQuad",
  });
}
