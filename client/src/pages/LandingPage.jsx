import React, { useState, useEffect } from 'react';
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
  Globe,
  Radio,
  Wifi,
  WifiOff,
  Bell,
  KeyRound,
  Cpu,
  Layers,
  BarChart3,
  Database,
  ChevronDown,
  ChevronUp,
  Play,
  Check,
  ShieldAlert,
  Sparkles,
  Navigation,
  Clock,
  RefreshCw,
  Gauge,
  ExternalLink,
  Users,
  FileSpreadsheet,
  Leaf,
  FileText,
  LifeBuoy
} from 'lucide-react';

export default function LandingPage() {
  // Interactive Hero Deck state
  const [activeTab, setActiveTab] = useState('map');
  const [simulatedTime, setSimulatedTime] = useState(new Date().toLocaleTimeString());
  const [simulatorAlert, setSimulatorAlert] = useState(null);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);

  // Live telemetry mock vehicles
  const liveVehicles = [
    {
      id: 'KA-01-EQ-9042',
      model: 'Tata Prima 4928.S',
      driver: 'Rajesh Kumar',
      status: 'In Transit',
      statusColor: 'emerald',
      speed: 68,
      fuel: 78,
      lat: '12.9716° N',
      lng: '77.5946° E',
      location: 'NH-48 Outer Ring Road, Bengaluru',
      zone: 'Zone A - South Corridor',
      battery: '94%',
      temp: '24°C'
    },
    {
      id: 'MH-12-PQ-4821',
      model: 'Mahindra Blazo X 28',
      driver: 'Sunil Patil',
      status: 'Loading Bay',
      statusColor: 'amber',
      speed: 0,
      fuel: 52,
      lat: '18.5204° N',
      lng: '73.8567° E',
      location: 'Chakan Industrial Gate 4, Pune',
      zone: 'Zone B - Chakan Warehouse',
      battery: '88%',
      temp: '26°C'
    },
    {
      id: 'DL-04-AB-1199',
      model: 'Eicher Pro 6035',
      driver: 'Amit Sharma',
      status: 'Fast Express',
      statusColor: 'cyan',
      speed: 82,
      fuel: 89,
      lat: '28.6139° N',
      lng: '77.2090° E',
      location: 'Delhi-Mumbai Expressway, Sec 32',
      zone: 'Zone C - North Hub',
      battery: '98%',
      temp: '22°C'
    },
    {
      id: 'TN-09-CD-5678',
      model: 'Ashok Leyland Captain',
      driver: 'Venkatesh R',
      status: 'Geofence Breach',
      statusColor: 'rose',
      speed: 44,
      fuel: 41,
      lat: '13.0827° N',
      lng: '80.2707° E',
      location: 'Perungudi Toll Exit, Chennai',
      zone: 'Restricted Port Perimeter',
      battery: '76%',
      temp: '28°C'
    }
  ];

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulator actions
  const triggerSimAlert = (title, message, type = 'info') => {
    setSimulatorAlert({ title, message, type });
    const timer = setTimeout(() => {
      setSimulatorAlert(null);
    }, 6000);
    return () => clearTimeout(timer);
  };

  const currentVehicle = liveVehicles[activeVehicleIndex];

  const faqs = [
    {
      q: 'How does the Driver PWA maintain tracking when cell reception drops?',
      a: 'The SmartFleet Driver PWA uses an offline-first architecture with browser IndexedDB. While moving through tunnels or remote corridors without 4G/5G, GPS coordinates and trip telemetry are locally persisted and queued. As soon as cellular connectivity returns, the engine auto-flushes the buffered packet stream to the central Socket.io gateway without loss of historical track points.'
    },
    {
      q: 'What is the Secondary Credential Vault and why is it essential?',
      a: 'Standard fleet software allows any logged-in administrator or technician to view sensitive vehicle engine numbers, RC documents, insurance copies, driver Aadhaar/PAN cards, and payroll bank details. SmartFleet AI introduces a Tier-2 cryptographic secondary password check. Even authenticated users must verify the secondary passkey before any sensitive document or credential is decrypted and displayed on screen.'
    },
    {
      q: 'Can managers set up polygon and radial geofences with instant alarms?',
      a: 'Yes. Fleet managers can draw arbitrary polygonal shapes or circular radial zones around customer warehouses, loading hubs, tolls, or hazardous zones. When a vehicle crosses the perimeter, an instantaneous socket event is dispatched triggering visual banners, sound notifications, and automatic trip log annotations.'
    },
    {
      q: 'Is any proprietary OBD hardware required or can we use smartphones?',
      a: 'SmartFleet AI supports both! Drivers can simply launch the lightweight Progressive Web App (PWA) on any standard Android or iOS smartphone to provide high-precision HTML5 Geolocation tracking with zero app store install friction. The backend also supports hardware GPS tracker telemetry ingestion via standard webhook APIs.'
    },
    {
      q: 'How does SmartFleet calculate automated driver salary and trip compensation?',
      a: 'The integrated Salary & Logbook module tracks exact verified kilometers logged by each driver, hours on duty, completed delivery milestones, and overtime allowances. Managers can generate instant, tamper-proof payroll sheets with PDF export, audit trails, and automatic deductions for fuel anomalies.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic Background Mesh Gradients */}
      <div className="pointer-events-none fixed -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[160px] animate-pulse-glow" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-[650px] w-[650px] rounded-full bg-indigo-600/10 blur-[180px] animate-pulse-glow" />
      <div className="pointer-events-none fixed -bottom-32 left-10 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

      {/* Top Telemetry Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-900/40 border-b border-slate-800/80 px-4 py-2 text-center text-xs font-medium text-slate-300 flex items-center justify-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-bold border border-amber-400/20 text-[11px]">
          <Sparkles className="w-3 h-3 text-amber-400" /> Platform Release v2.4
        </span>
        <span>Sub-second Socket.io Fleet Telemetry • Mobile Driver PWA with Offline Storage • Secondary Credential Protection</span>
        <NavLink to="/login" className="text-amber-400 hover:text-amber-300 font-bold underline text-xs ml-1 inline-flex items-center gap-1">
          Explore Demo <ArrowRight className="w-3 h-3" />
        </NavLink>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-100 tracking-tight leading-none">
                  SmartFleet<span className="text-amber-400">.AI</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                Autonomous Telematics & PWA OS
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#deck" className="hover:text-amber-400 transition-colors">Live Deck</a>
            <a href="#portals" className="hover:text-amber-400 transition-colors">Dual Portals</a>
            <a href="#features" className="hover:text-amber-400 transition-colors">Capabilities</a>
            <a href="#security" className="hover:text-amber-400 transition-colors">Security Vault</a>
            <a href="#architecture" className="hover:text-amber-400 transition-colors">Architecture</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
          </nav>

          {/* Portal Navigation Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <NavLink
              to="/driver/login"
              className="px-3 sm:px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 hover:border-emerald-500/50"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Driver</span> PWA
            </NavLink>
            <NavLink
              to="/login"
              className="px-3.5 sm:px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5"
            >
              <span>Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Simulator Interactive Toast Notification */}
      {simulatorAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short">
          <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
            simulatorAlert.type === 'danger'
              ? 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-rose-900/30'
              : simulatorAlert.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-900/30'
              : 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-900/30'
          }`}>
            <div className="flex items-start gap-3">
              {simulatorAlert.type === 'danger' ? (
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              ) : simulatorAlert.type === 'warning' ? (
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h5 className="font-bold text-sm tracking-tight">{simulatorAlert.title}</h5>
                <p className="text-xs mt-1 text-slate-300 leading-relaxed">{simulatorAlert.message}</p>
              </div>
              <button
                onClick={() => setSimulatorAlert(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-full text-xs font-semibold text-slate-300 mb-8 backdrop-blur-md shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-amber-400 font-bold">SmartFleet OS 2.4</span>
          <span className="text-slate-500">•</span>
          <span>Zero-Latency WebSockets</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400 font-bold">Offline PWA Sync</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-100 tracking-tight max-w-5xl mx-auto leading-[1.15]">
          Real-Time GPS Fleet Tracking, <br className="hidden sm:block" />
          <span className="amber-gradient-text">Driver PWA</span> & Telematics Platform
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-3xl mx-auto mt-6 leading-relaxed font-normal">
          Unify sub-second vehicle GPS telemetry, secondary credential verification, offline-buffered mobile driver tracking, automated polygon geofences, fuel efficiency intelligence, and salary logbooks in one hyper-responsive cloud ecosystem.
        </p>

        {/* Main CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <NavLink
            to="/login"
            className="px-7 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-sm md:text-base shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2.5 transform hover:-translate-y-1"
          >
            <ShieldCheck className="w-5 h-5" /> Launch Admin Command Desk
          </NavLink>

          <NavLink
            to="/driver/login"
            className="px-7 py-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 text-slate-100 font-bold rounded-2xl text-sm md:text-base shadow-lg transition-all flex items-center gap-2.5 transform hover:-translate-y-1"
          >
            <Smartphone className="w-5 h-5 text-emerald-400" /> Open Mobile Driver PWA
          </NavLink>

          <a
            href="#simulator"
            className="px-5 py-4 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-2xl text-xs md:text-sm transition-all flex items-center gap-2"
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> Try Live Simulator
          </a>
        </div>

        {/* Quick Credentials Info Box */}
        <div className="mt-6 max-w-xl mx-auto p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Quick Demo Credentials:
          </span>
          <div className="flex items-center gap-3">
            <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-slate-300">
              Admin: admin@fleetflow.com / admin123
            </span>
            <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-slate-300">
              PIN: 1234
            </span>
          </div>
        </div>

        {/* Interactive Telemetry Showcase Deck */}
        <div id="deck" className="mt-14 max-w-6xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-slate-800/80 via-slate-900 to-slate-950 shadow-2xl border border-slate-800">
          <div className="bg-slate-950/95 rounded-[22px] overflow-hidden">
            {/* Top Deck Header */}
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-4 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="h-4 w-px bg-slate-800 mx-1" />
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  SmartFleet Unified Command Deck
                </span>
              </div>

              {/* Deck Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'map'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" /> Fleet Radar
                </button>
                <button
                  onClick={() => setActiveTab('driver')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'driver'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Driver PWA HUD
                </button>
                <button
                  onClick={() => setActiveTab('geofence')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'geofence'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Geofences
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'telemetry'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" /> Telemetry Stream
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  SYNCED
                </span>
                <span>{simulatedTime}</span>
              </div>
            </div>

            {/* Deck Content Area */}
            <div className="p-6">
              {activeTab === 'map' && (
                <div className="space-y-6">
                  {/* Vehicle Selector row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                    {liveVehicles.map((veh, idx) => (
                      <div
                        key={veh.id}
                        onClick={() => setActiveVehicleIndex(idx)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          activeVehicleIndex === idx
                            ? 'bg-slate-900 border-amber-500/70 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-100 tracking-tight">{veh.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            veh.statusColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            veh.statusColor === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            veh.statusColor === 'cyan' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                          }`}>
                            {veh.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 truncate">{veh.driver} • {veh.model}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono mt-2 pt-2 border-t border-slate-800/60">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Gauge className="w-3 h-3 text-amber-400" /> {veh.speed} km/h
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Fuel className="w-3 h-3 text-emerald-400" /> {veh.fuel}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Simulated Live Map Canvas */}
                  <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 relative overflow-hidden text-left min-h-[300px] flex flex-col justify-between">
                    {/* Background Grid Lines simulating GIS map */}
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Active Telemetry Node</span>
                        <h4 className="text-xl font-black text-slate-100 mt-0.5">{currentVehicle.id} — {currentVehicle.model}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" /> {currentVehicle.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                          GPS: {currentVehicle.lat}, {currentVehicle.lng}
                        </span>
                      </div>
                    </div>

                    {/* Simulated Path Visualizer */}
                    <div className="my-6 relative z-10 bg-slate-950/90 p-4 rounded-xl border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-400 font-medium">Route Progress & Live Heading:</span>
                        <span className="text-emerald-400 font-bold">82% Completed • On Schedule</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                        <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full w-[82%]" />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                        <span>Origin: Bengaluru Logistics Terminal</span>
                        <span>Current: {currentVehicle.zone}</span>
                        <span>Destination: Chennai Port Terminal</span>
                      </div>
                    </div>

                    {/* Telemetry Gauge Indicators */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 text-xs">
                      <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Speed</span>
                        <span className="text-lg font-black text-slate-100 font-mono">{currentVehicle.speed} <span className="text-xs text-slate-400 font-normal">km/h</span></span>
                      </div>
                      <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Fuel Tank Status</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">{currentVehicle.fuel}%</span>
                      </div>
                      <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Device Battery</span>
                        <span className="text-lg font-black text-cyan-400 font-mono">{currentVehicle.battery}</span>
                      </div>
                      <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Cabin Climate</span>
                        <span className="text-lg font-black text-amber-400 font-mono">{currentVehicle.temp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'driver' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                  {/* Smartphone Frame Mockup */}
                  <div className="max-w-xs mx-auto w-full bg-slate-950 rounded-[36px] p-4 border-4 border-slate-800 shadow-2xl relative">
                    <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4" />
                    
                    {/* Mobile App Screen Mockup */}
                    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-xs text-slate-200">SmartFleet Driver</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {isOfflineSimulated ? 'OFFLINE (IDB)' : 'ONLINE'}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Shift Trip</span>
                        <span className="font-bold text-sm text-slate-200">#TRP-84920 Bangalore ➔ Pune</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Assigned to: Rajesh Kumar</p>
                      </div>

                      {/* Speedometer dial preview */}
                      <div className="text-center py-4 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">68</span>
                        <span className="text-xs text-slate-400 block font-medium">KM / HOUR</span>
                        <span className="text-[10px] text-emerald-400 font-mono mt-1 block">GPS Latency: 24ms</span>
                      </div>

                      {/* 3-tap buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button className="py-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-700">
                          Pause Trip
                        </button>
                        <button className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1">
                          <AlertOctagon className="w-3.5 h-3.5" /> SOS PANIC
                        </button>
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 font-mono">
                          IndexedDB Queue: {isOfflineSimulated ? '14 points cached' : '0 pending sync'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Driver PWA Features Detail */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">
                      <Smartphone className="w-3.5 h-3.5" /> Zero App Store Friction
                    </div>
                    <h3 className="text-2xl font-black text-slate-100">
                      Installable Mobile PWA with Offline-First Resiliency
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Drivers can launch SmartFleet instantly in Google Chrome or Safari on iOS and Android. No 200MB app downloads or store approvals needed.
                    </p>

                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2.5 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-100">3-Tap Workflow:</strong> Start Shift, Log Rest Breaks, and Complete Trip with photo verification.
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-100">IndexedDB Geolocation Cache:</strong> Keeps streaming lat/lng points even when signal is lost across mountain passes.
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-100">Emergency SOS Sentinel:</strong> Dispatches real-time distress coordinates straight to headquarters.
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <NavLink
                        to="/driver/login"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20"
                      >
                        Experience Driver PWA <ArrowRight className="w-4 h-4" />
                      </NavLink>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'geofence' && (
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-lg font-black text-slate-100">Dynamic Polygonal & Radial Geofencing</h4>
                      <p className="text-xs text-slate-400">Intelligent perimeter surveillance with automatic violation dispatch triggers.</p>
                    </div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      4 Active Perimeters Monitored
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">Bengaluru Warehouse Zone</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Inside (2)</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Radius: 3.5 km • Loading dock access 24/7</p>
                      <div className="text-slate-500 text-[10px] font-mono">Polygon: 12 vertices defined</div>
                    </div>

                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">NH-48 High-Speed Corridor</span>
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Transiting (1)</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Linear corridor buffer: 250m max leeway</p>
                      <div className="text-slate-500 text-[10px] font-mono">Speed threshold: 80 km/h cap</div>
                    </div>

                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-rose-900/50 space-y-2 bg-rose-950/20">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300">Restricted Port Perimeter</span>
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded animate-pulse">BREACH ALERT</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">TN-09-CD-5678 crossed unauthorised cordon</p>
                      <div className="text-rose-400 text-[10px] font-mono">Admin alert dispatched 42s ago</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'telemetry' && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-left text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                    <span>Socket.io Telemetry Event Stream (Live JSON Pings)</span>
                    <span className="text-emerald-400">Sample Rate: 1000ms</span>
                  </div>
                  <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed p-3 bg-slate-900/80 rounded-xl border border-slate-800">
{`{
  "event": "VEHICLE_TELEMETRY_INGEST",
  "nodeId": "${currentVehicle.id}",
  "timestamp": "${new Date().toISOString()}",
  "telematics": {
    "coordinates": { "lat": 12.9716, "lng": 77.5946, "accuracy": 3.8 },
    "speedKmh": ${currentVehicle.speed},
    "headingDeg": 142.6,
    "odometerKm": 48201.4,
    "fuelLevelPct": ${currentVehicle.fuel},
    "batteryLevelPct": 94,
    "ignitionStatus": true,
    "tamperSensor": "SECURE",
    "networkTransport": "${isOfflineSimulated ? 'INDEXED_DB_BUFFER_REPLAY' : 'WEBSOCKET_DIRECT'}"
  }
}`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Bar */}
      <section id="simulator" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Interactive Telematics Sandbox</span>
              </div>
              <h3 className="text-lg font-black text-slate-100">Test SmartFleet Engine In Real-Time</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Simulate critical fleet operational scenarios right here on the landing page and see how our event engine reacts!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => triggerSimAlert(
                  '🚨 DRIVER SOS PANIC TRIGGERED!',
                  'Vehicle TN-09-CD-5678 emitted critical emergency beacon at Perungudi Toll Exit. Alert sounded in dispatch room.',
                  'danger'
                )}
                className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <AlertOctagon className="w-4 h-4 text-rose-400" /> Simulate SOS Panic
              </button>

              <button
                onClick={() => triggerSimAlert(
                  '⚠️ GEOFENCE PERIMETER BREACH',
                  'Vehicle KA-01-EQ-9042 exited designated corridor boundary at NH-48 Outer Ring. Manager notification sent.',
                  'warning'
                )}
                className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-amber-400" /> Simulate Geofence Breach
              </button>

              <button
                onClick={() => {
                  const nextState = !isOfflineSimulated;
                  setIsOfflineSimulated(nextState);
                  if (nextState) {
                    triggerSimAlert(
                      '📶 SIMULATED OFFLINE MODE (IndexedDB Active)',
                      'Cell signal lost. Driver PWA is now accumulating coordinates in local IndexedDB storage queue.',
                      'warning'
                    );
                  } else {
                    triggerSimAlert(
                      '⚡ CELLULAR RECONNECTED',
                      '14 buffered GPS packets uploaded and synced to central telemetry server without packet loss.',
                      'info'
                    );
                  }
                }}
                className={`px-4 py-2.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isOfflineSimulated
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                {isOfflineSimulated ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                {isOfflineSimulated ? 'Reconnect Signal' : 'Simulate Offline Mode'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Metrics Counter Grid */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-left hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Socket Sync</span>
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight font-mono">&lt; 150ms</div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Continuous bidirectional telemetry stream latency.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-left hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offline Cache</span>
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight font-mono">100%</div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">IndexedDB zero-data-loss buffer guarantee.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-left hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ops Modules</span>
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight font-mono">21+</div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Specialized fleet, route, salary, and maintenance modules.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-left hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Tier</span>
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight font-mono">Tier-2</div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Secondary credential vault protecting confidential vehicle & HR data.</p>
          </div>
        </div>
      </section>

      {/* Dual Portals Showcase */}
      <section id="portals" className="py-20 px-4 sm:px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Two Specialized Applications</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mt-2">
              Engineered For Both Command Center & Road Warriors
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-3">
              Fleet operations require deep administrative power at HQ, and lightweight simplicity on the driver’s phone. SmartFleet delivers both.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Admin Command Portal Card */}
            <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-8 transition-all group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Role: Super Admin / Dispatcher
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-100">HQ Admin & Operations Command Room</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    A comprehensive multi-monitor control suite designed for logistics managers, dispatchers, accountants, and safety auditors.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Live Leaflet Radar:</strong> Real-time markers, speeds, and breadcrumb trails.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Secondary Vault:</strong> PIN-guarded vehicle RC, chassis, & PAN data.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Dynamic Geofencing:</strong> Polygon & radial perimeter management.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Salary & Reports:</strong> 1-click PDF/CSV export for driver compensation.</span>
                  </div>
                </div>
              </div>

              <div>
                <NavLink
                  to="/login"
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm text-center transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  Enter Admin Command Portal <ArrowRight className="w-4 h-4" />
                </NavLink>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-mono">
                  Default login: admin@fleetflow.com (Pass: admin123)
                </p>
              </div>
            </div>

            {/* Driver PWA Portal Card */}
            <div className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-8 transition-all group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Role: Field Driver
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-100">Driver Mobile Progressive Web App (PWA)</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    A streamlined, mobile-optimized experience with high-contrast UI designed for truck drivers on highway routes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>3-Tap Dispatch:</strong> Accept trip, start GPS tracking, complete drop-off.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Offline Storage:</strong> Continuous tracking even without cellular signal.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Live Speedometer:</strong> High contrast digital gauge with speed cap warnings.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Emergency SOS:</strong> High-priority 1-press distress broadcast.</span>
                  </div>
                </div>
              </div>

              <div>
                <NavLink
                  to="/driver/login"
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-100 font-black rounded-2xl text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Launch Driver Mobile PWA
                </NavLink>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-mono">
                  Default login: driver@fleetflow.com (Pass: driver123)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Capabilities Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Complete Fleet Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mt-2">
            Engineered For Every Dimension of Logistics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-3">
            From granular GPS telemetry to multi-driver payroll and safety compliance, explore the core engines driving SmartFleet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-100">Sub-Second Leaflet GIS Map</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive Leaflet integration with custom markers for active transit, loading idle, maintenance, and SOS alerts with animated vehicle trails.
            </p>
            <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              Real-time Socket Feed <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-100">Secondary Credential Vault</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographic secondary password prompt protects confidential vehicle chassis IDs, RC registration numbers, PAN documents, and driver bank records.
            </p>
            <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
              Zero-Trust Security <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-4 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-100">Offline-First IndexedDB Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drivers navigating remote mountain corridors or cellular blind spots accumulate coordinates locally in browser IndexedDB with automatic cloud sync.
            </p>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              Uninterrupted Tracking <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all space-y-4 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-100">Instant Driver SOS Sentinel</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Emergency distress signal broadcasts real-time GPS coordinates to the manager console with audio alerts, email notifications, and instant nearest-depot routing.
            </p>
            <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
              Driver Safety First <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Fuel className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-100">Fuel Optimization & Fraud AI</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cross-references odometer logs against fuel receipts and GPS distance to automatically detect abnormal fuel siphoning and consumption spikes.
            </p>
            <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
              Mileage Protection <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-yellow-500/40 transition-all space-y-4 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-100">Automated Salary & Digital Logbooks</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Converts verified GPS route distances and duty hours into precise monthly driver compensation sheets with instant PDF and CSV export.
            </p>
            <div className="text-[11px] font-semibold text-yellow-400 flex items-center gap-1">
              Automated Payroll <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Security Vault Deep-Dive Spotlight */}
      <section id="security" className="py-20 px-4 sm:px-6 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" /> Two-Tier Zero-Trust Protocol
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-slate-100 leading-tight">
                  Secondary Credential Vault: <br />
                  <span className="amber-gradient-text">Defense-in-Depth for Fleet Data</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Most fleet management systems present an open risk: once a user logs in, all vehicle registration numbers, engine chassis IDs, RC certificates, driver identity records, and bank accounts are nakedly exposed.
                </p>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  SmartFleet implements an isolated cryptographic credential barrier. Sensitive fields are masked on the screen until the user validates with an authorized Secondary Security PIN or master authorization key.
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Masked Chassis Numbers
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Protected Driver Bank Info
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tamper-Proof Audit Logging
                  </div>
                </div>
              </div>

              {/* Visual Vault Simulation Box */}
              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Confidential Vehicle Records
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    ENCRYPTED
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Chassis Number:</span>
                    <span className="font-mono text-slate-300">MAT84920••••••••</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Engine Serial:</span>
                    <span className="font-mono text-slate-300">ENG-9921••••••••</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Driver Bank A/C:</span>
                    <span className="font-mono text-slate-300">HDFC000••••••••</span>
                  </div>

                  {/* Unlock Prompt preview */}
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 block">Enter 4-Digit Secondary Vault PIN</span>
                    <div className="flex justify-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-slate-200">•</div>
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-slate-200">•</div>
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-slate-200">•</div>
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-slate-200">•</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern System Architecture Grid */}
      <section id="architecture" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Built On Modern Technologies</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mt-2">
            Engineered For Low Latency & High Scale
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-3">
            A battle-tested stack combining reactive user interfaces, real-time socket connections, and edge-persisted offline storage.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="text-amber-400 text-xl font-black font-mono">React 18</div>
            <p className="text-[11px] text-slate-400">Concurrent reactive UI & lazy modules</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="text-emerald-400 text-xl font-black font-mono">Leaflet GIS</div>
            <p className="text-[11px] text-slate-400">Lightweight maps & custom marker layers</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="text-cyan-400 text-xl font-black font-mono">Socket.IO</div>
            <p className="text-[11px] text-slate-400">Bidirectional sub-second telemetry pings</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="text-indigo-400 text-xl font-black font-mono">IndexedDB</div>
            <p className="text-[11px] text-slate-400">Zero-loss offline buffer queue for mobile</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="text-rose-400 text-xl font-black font-mono">Node / Express</div>
            <p className="text-[11px] text-slate-400">Scalable REST API & security middleware</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="text-amber-400 text-xl font-black font-mono">Tailwind CSS</div>
            <p className="text-[11px] text-slate-400">Dark-first high-contrast logistics UX</p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Common Questions</span>
            <h2 className="text-3xl font-black text-slate-100 mt-2">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Everything you need to know about GPS telemetry, driver tracking, and platform architecture.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? -1 : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="font-bold text-sm text-slate-200">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-900 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final High-Conversion Call To Action */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-slate-900 to-indigo-900/30 border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="px-3.5 py-1 rounded-full bg-amber-400/10 text-amber-300 font-bold border border-amber-400/20 text-xs">
              ⚡ Get Started in 30 Seconds
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              Ready to Modernize Your Fleet Operations?
            </h2>

            <p className="text-xs sm:text-base text-slate-400 leading-relaxed">
              Experience the dual synergy of an enterprise command center and an offline-resilient driver mobile application. No installation necessary.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <NavLink
                to="/login"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-sm md:text-base shadow-xl shadow-amber-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-1"
              >
                Sign In to Admin Dashboard <ArrowRight className="w-4 h-4" />
              </NavLink>

              <NavLink
                to="/driver/login"
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-200 font-bold rounded-2xl text-sm md:text-base shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-1"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" /> Open Mobile Driver PWA
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Enterprise Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-8 text-left text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 rounded-xl text-slate-950 font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-slate-100 tracking-tight">
                SmartFleet<span className="text-amber-400">.AI</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Enterprise fleet telemetry, real-time GPS tracking, secondary credential protection, and offline-buffered driver PWA ecosystem.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              All Services Operational (99.98%)
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Portals & Access</h5>
            <ul className="space-y-2 text-slate-400">
              <li><NavLink to="/login" className="hover:text-amber-400 transition-colors">Admin Command Center</NavLink></li>
              <li><NavLink to="/driver/login" className="hover:text-amber-400 transition-colors">Driver Mobile PWA</NavLink></li>
              <li><a href="#simulator" className="hover:text-amber-400 transition-colors">Interactive Simulator</a></li>
              <li><a href="#deck" className="hover:text-amber-400 transition-colors">Live Telemetry Radar</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Enterprise Modules</h5>
            <ul className="space-y-2 text-slate-400">
              <li><NavLink to="/live-map" className="hover:text-amber-400 transition-colors">Live Leaflet Tracking</NavLink></li>
              <li><NavLink to="/geofencing" className="hover:text-amber-400 transition-colors">Polygon Geofencing</NavLink></li>
              <li><NavLink to="/fuel" className="hover:text-amber-400 transition-colors">Fuel Anomaly Detection</NavLink></li>
              <li><NavLink to="/salary" className="hover:text-amber-400 transition-colors">Automated Driver Payroll</NavLink></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Security & Compliance</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#security" className="hover:text-amber-400 transition-colors">Secondary Credential Vault</a></li>
              <li><span className="text-slate-500">AES-256 Payload Encryption</span></li>
              <li><span className="text-slate-500">IndexedDB Secure Caching</span></li>
              <li><span className="text-slate-500">Role-Based Access Control</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 SmartFleet AI Platform. Enterprise Fleet Telemetry & Driver PWA Engine.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Privacy Shield</span>
            <span>•</span>
            <span className="hover:text-slate-400">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400">Telemetry SLA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
