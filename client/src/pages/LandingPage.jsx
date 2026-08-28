import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Truck,
  Smartphone,
  Lock,
  Fuel,
  AlertOctagon,
  TrendingUp,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="pointer-events-none fixed -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px]" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[150px]" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-100 tracking-tight block leading-none">
                SmartFleet AI
              </span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Enterprise Telemetry
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
            <a href="#portals" className="hover:text-amber-400 transition-colors">Portals</a>
            <a href="#security" className="hover:text-amber-400 transition-colors">Security</a>
            <a href="#analytics" className="hover:text-amber-400 transition-colors">Analytics</a>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/driver/login"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Driver PWA Portal
            </NavLink>
            <NavLink
              to="/login"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold mb-6 animate-pulse">
          <Zap className="w-4 h-4" /> Next-Gen Fleet, Driver & GPS Telemetry Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight">
          Real-Time GPS Tracking, Driver PWA & Fleet Analytics
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          SmartFleet AI unifies live vehicle telemetry, secondary credential verification, offline-buffered driver tracking, fuel optimization, and automated logbooks in one seamless enterprise experience.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <NavLink
            to="/login"
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs md:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            Launch Command Dashboard <ArrowRight className="w-4 h-4" />
          </NavLink>
          <NavLink
            to="/driver/login"
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-2xl text-xs md:text-sm shadow-lg transition-all flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-amber-400" /> Open Mobile Driver PWA
          </NavLink>
        </div>

        {/* Hero Interactive Telemetry Preview Card */}
        <div className="mt-14 max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-slate-200">Live Active Fleet Feed — 100% Realtime Socket Sync</span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              5 Vehicles Active • 0 Latency
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-bold text-slate-300">
                <span>KA-01-EQ-9042</span>
                <span className="text-emerald-400">68 km/h</span>
              </div>
              <p className="text-slate-400 text-[11px]">Tata Prima 4928.S • Rajesh Kumar</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[82%]" />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-bold text-slate-300">
                <span>MH-12-PQ-4821</span>
                <span className="text-amber-400">IDLE</span>
              </div>
              <p className="text-slate-400 text-[11px]">Mahindra Blazo X 28 • Sunil Patil</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[45%]" />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-bold text-slate-300">
                <span>TN-09-CD-5678</span>
                <span className="text-rose-400 font-extrabold animate-pulse">SOS ACTIVE</span>
              </div>
              <p className="text-slate-400 text-[11px]">Ashok Leyland Captain • Venkatesh R</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[100%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Showcase Section */}
      <section id="portals" className="py-16 px-6 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Dual Portals</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-100 mt-1">Built For Fleet Ops & Mobile Drivers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Admin Portal Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-100">Admin & Manager Control Room</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full command over live GPS maps, 21 specialized modules, secondary credential verification, salary disbursement, geofence zones, and PDF/CSV reports.
                </p>
              </div>

              <NavLink
                to="/login"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs text-center transition-all shadow-lg shadow-amber-500/20"
              >
                Sign In to Admin Portal
              </NavLink>
            </div>

            {/* Driver PWA Portal Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-100">Driver Mobile PWA Application</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Installable PWA experience with 3-tap trip start/end, high precision geolocation watcher, IndexedDB offline buffering, live speedometer, and SOS emergency button.
                </p>
              </div>

              <NavLink
                to="/driver/login"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs text-center transition-all shadow-md"
              >
                Sign In to Driver PWA
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Enterprise Architecture</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 mt-1">Features Built for Maximum Reliability</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
            <MapPin className="w-8 h-8 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-100">Leaflet Live GPS Maps</h4>
            <p className="text-xs text-slate-400">
              Interactive Leaflet maps with custom vehicle markers for moving, idle, offline, SOS, and geofence violations.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
            <Lock className="w-8 h-8 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-100">Secondary Credential Vault</h4>
            <p className="text-xs text-slate-400">
              Requires a second independent password before exposing sensitive chassis numbers, RC documents, PAN or bank info.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
            <AlertOctagon className="w-8 h-8 text-rose-500" />
            <h4 className="text-sm font-bold text-slate-100">Instant Driver SOS Panic Button</h4>
            <p className="text-xs text-slate-400">
              Sends emergency GPS coordinates immediately to the admin command center with audio-visual critical alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 SmartFleet AI Platform. Enterprise Fleet, Driver PWA & GPS Tracking Engine.</p>
      </footer>
    </div>
  );
}
