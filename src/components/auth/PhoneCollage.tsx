"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import Image from "next/image";

/**
 * The phone collage on the login promo (docs/screenshots/img7).
 *
 * The original is a Meta stock photo we do not own, so the cards use our own
 * bundled photos (`public/promo/`). They ship with the app rather than coming
 * from the API: the promo panel renders before login, and this backend both
 * drops old uploads and hosts other users' personal pictures.
 *
 * `src` takes either a local path (optimised through next/image) or a full
 * https:// URL (rendered with a plain <img>, so any host works without touching
 * `next.config.ts`). Prefer a big portrait picture — ~900×1350; a small
 * thumbnail will look soft once it is stretched into the card.
 */

const CARDS = [
  {
    id: "left",
    src: "https://i.pinimg.com/originals/a3/ee/74/a3ee74578c1a5f22916fad130329ac95.jpg",
    rest: { x: -112, y: 30, rotate: -12, scale: 0.88 },
    hover: { x: -168, y: 12, rotate: -17, scale: 0.92 },
    z: 1,
    delay: 0,
  },
  {
    id: "right",
    src: "https://famouspeopletoday.com/wp-content/uploads/2024/08/Conor-McGregor-Net-Worth-1-768x1152.jpg",
    rest: { x: 112, y: 30, rotate: 12, scale: 0.88 },
    hover: { x: 168, y: 12, rotate: 17, scale: 0.92 },
    z: 1,
    delay: 0.4,
  },
  {
    id: "lead",
    src: "https://tse3.mm.bing.net/th/id/OIP.EuWdLr1Om_WLHRPQV97kmQHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    rest: { x: 0, y: 0, rotate: 0, scale: 1 },
    hover: { x: 0, y: -16, rotate: 0, scale: 1.06 },
    z: 3,
    delay: 0.8,
  },
] as const;

export function PhoneCollage() {
  return (
    <motion.div
      className="relative mx-auto flex h-[420px] w-full max-w-[520px] items-center justify-center"
      initial="rest"
      animate="rest"
      whileHover="hover"
    >
      {CARDS.map((card) => (
        <motion.div
          key={card.id}
          className="absolute"
          style={{ zIndex: card.z }}
          variants={{ rest: card.rest, hover: card.hover }}
          transition={{ type: "spring", stiffness: 170, damping: 19 }}
        >
          <PhoneCard src={card.src} delay={card.delay} lead={card.id === "lead"} />
        </motion.div>
      ))}

      {/* Floating chrome from the reference: a reaction bubble and a heart. */}
      <motion.div
        className="absolute top-4 left-0 z-[4] flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-xl"
        variants={{ rest: { y: 0, rotate: -6 }, hover: { y: -12, rotate: -10 } }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
      >
        <span className="text-base leading-none">😍</span>
        <span className="text-base leading-none">🔥</span>
        <span className="text-base leading-none">👏</span>
      </motion.div>

      <motion.div
        className="absolute bottom-10 -left-2 z-[4]"
        animate={{ y: [0, -12, 0], rotate: [-8, -2, -8] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="size-14 fill-[#ed4956] text-[#ed4956] drop-shadow-xl" />
      </motion.div>
    </motion.div>
  );
}

const isRemote = (src: string) => /^https?:\/\//.test(src);

function PhoneCard({ src, delay, lead }: { src: string; delay: number; lead: boolean }) {
  return (
    <motion.div
      // A slow, offset bob gives the group life without demanding attention.
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      className={`relative overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-white/25 ${
        lead ? "h-[340px] w-[204px]" : "h-[306px] w-[184px]"
      }`}
    >
      {isRemote(src) ? (
        // A full http(s) URL goes through a plain <img>: next/image would demand
        // the host in next.config.ts `images.remotePatterns`, so pasting any URL
        // into CARDS would otherwise throw "hostname is not configured".
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Image src={src} alt="" fill sizes="204px" className="object-cover" priority />
      )}

      {/* Scrim so the story chrome stays readable over any photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/35" />

      <div className="relative flex h-full flex-col justify-between p-3">
        <div className="space-y-2.5">
          <div className="flex gap-1">
            <span className="h-[3px] flex-1 rounded-full bg-white" />
            <span className="h-[3px] flex-1 rounded-full bg-white/45" />
            <span className="h-[3px] flex-1 rounded-full bg-white/45" />
          </div>
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-white/90 ring-2 ring-white/40" />
            <span className="h-2 w-16 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-white drop-shadow">
            <Heart className="size-5 fill-white" />
            <MessageCircle className="size-5" />
            <Send className="size-5" />
          </div>
          <span className="block h-2 w-3/4 rounded-full bg-white/80" />
          <span className="block h-2 w-1/2 rounded-full bg-white/50" />
        </div>
      </div>
    </motion.div>
  );
}
