// src/shared/components/layout/AuthLayout.jsx
"use client";

import { Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(2,6,23,1))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-30" />
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <LampContainer>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center px-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 inline-block"
            >
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-400 to-indigo-500 shadow-[0_0_50px_rgba(56,189,248,0.45)]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
                <svg className="w-10 h-10 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </motion.div>

            <h1 className="mb-4 text-5xl font-semibold tracking-tight text-transparent bg-gradient-to-br from-slate-100 via-sky-100 to-slate-300 bg-clip-text">
              Loyiha Monitoring
            </h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-1 w-32 mx-auto mb-6 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"
            />

            <p className="mx-auto max-w-md text-base leading-7 text-slate-300/85">
              Loyihalarni real vaqt rejimida boshqarish va nazorat qilish tizimi
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-6"
            >
              {[
                { icon: "⚡", label: "Tezkor" },
                { icon: "🔒", label: "Xavfsiz" },
                { icon: "📊", label: "Samarali" }
              ].map((feature, index) => (
                <div key={index} 
                     className="group text-center"
                     style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="mb-2 text-3xl transition-transform duration-300 group-hover:scale-125">
                    {feature.icon}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                    {feature.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </LampContainer>
      </div>

      <div className="relative flex w-full flex-col bg-slate-950/70 backdrop-blur-xl lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/50" />
        
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl sm:p-8">
            <div className="mb-10 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-transparent bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text">
                Loyiha Monitoring
              </h1>
            </div>

            <Outlet />
          </div>
        </div>

        <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/30 py-6 text-center backdrop-blur-sm">
          <p className="text-xs font-medium tracking-wide text-slate-400">
            © 2026 Ko'prikQurilish AJ
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Barcha huquqlar himoyalangan
          </p>
        </footer>
      </div>
    </div>
  );
}
