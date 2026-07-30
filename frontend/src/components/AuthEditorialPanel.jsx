import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";

const AuthEditorialPanel = ({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative hidden min-h-[690px] overflow-hidden lg:block">
      <Motion.img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-[52%_center]"
        initial={prefersReducedMotion ? false : { scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-8 text-white">
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
          Edvance
        </span>
        <span className="h-px w-16 bg-white/35" />
      </div>
      <Motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.25,
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-x-0 bottom-0 p-9 text-white xl:p-12"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>
        <h2 className="mt-4 max-w-md font-serif text-4xl font-bold leading-[1.08] xl:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
          {description}
        </p>
      </Motion.div>
    </div>
  );
};

export default AuthEditorialPanel;
