import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage = () => {
  return (
    <div className="bg-fleet-cream dark:bg-slate-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7ead6] via-[#e0c39b] to-[#c89f70] dark:from-[#040913] dark:via-[#071227] dark:to-[#0c1d37]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-35"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-fleet-oxford/30 dark:bg-fleet-oxford/50" />
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <header className="mb-16 flex items-center justify-between rounded-2xl border border-fleet-tan/50 bg-fleet-oxford/35 px-5 py-4 text-white shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-lg bg-fleet-tan px-2 py-1 text-sm text-fleet-oxford">🚚</span>
              FleetFlow
            </div>
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button className="bg-fleet-tan text-fleet-oxford hover:bg-fleet-sand">Get Started</Button>
              </Link>
            </div>
          </header>

          <div className="max-w-2xl rounded-2xl border border-fleet-tan/40 bg-fleet-oxford/45 p-6 pb-8 text-white shadow-xl backdrop-blur-sm md:pb-10">
            <p className="mb-4 inline-flex rounded-full bg-fleet-tan px-4 py-1 text-sm font-semibold text-fleet-oxford">FleetFlow Logistics Platform</p>
            <h1 className="text-4xl font-bold leading-tight drop-shadow-sm md:text-5xl">
              Smart Fleet &
              <span className="block text-fleet-tan">Logistics Management</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-100">
              Take full digital control of your fleet operations. Monitor vehicles, dispatch trips, track maintenance, and optimize costs — all in one powerful platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login">
                <Button className="inline-flex items-center gap-2 bg-fleet-tan text-fleet-oxford hover:bg-fleet-sand">
                  Get Started <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-10 text-center">
          <p className="mx-auto mb-3 inline-flex rounded-full bg-fleet-tan px-4 py-1 text-sm font-semibold text-fleet-oxford">OUR SERVICES</p>
          <h2 className="section-title text-3xl">Comprehensive Fleet Solutions</h2>
          <p className="section-subtitle mx-auto mt-2 max-w-2xl">
            Everything you need to manage, track, and optimize your logistics operations in one unified platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Fleet Management',
              text: 'Track and manage your entire vehicle fleet with real-time status updates and comprehensive analytics.',
              image:
                'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=900&q=80',
              icon: <Truck size={18} />
            },
            {
              title: 'Trip Dispatching',
              text: 'Smart dispatch system with cargo validation, route optimization, and lifecycle tracking.',
              image:
                'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=900&q=80',
              icon: <ArrowRight size={18} />
            },
            {
              title: 'Maintenance Tracking',
              text: 'Automated service scheduling, cost tracking, and vehicle health monitoring for maximum uptime.',
              image:
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
              icon: <ShieldCheck size={18} />
            }
          ].map((item) => (
            <Card key={item.title} className="overflow-hidden !border-fleet-tan/70 !bg-fleet-cream/80 p-0 dark:!border-slate-700/60 dark:!bg-slate-900/65">
              <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
              <div className="p-5">
                <span className="inline-flex rounded-full bg-fleet-tan/35 p-2 text-fleet-oxford">{item.icon}</span>
                <h3 className="mt-4 text-xl font-semibold text-fleet-oxford dark:text-slate-100">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{item.text}</p>
                <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-fleet-oxford dark:text-fleet-tanVivid">
                  Read More <ChevronRight size={16} />
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 md:grid-cols-2 md:px-8">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-fleet-tan px-4 py-1 text-sm font-semibold text-fleet-oxford">WHY FLEETFLOW</p>
          <h3 className="section-title text-3xl leading-tight">Built for Modern Fleet Operations</h3>
          <p className="section-subtitle mt-4 text-base">
            FleetFlow combines powerful analytics, real-time tracking, and smart automation to give you complete control over your logistics network.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-fleet-oxford dark:text-fleet-tanVivid" /> Real-time GPS Tracking</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-fleet-oxford dark:text-fleet-tanVivid" /> Driver Compliance Management</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-fleet-oxford dark:text-fleet-tanVivid" /> Financial Analytics & ROI</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-fleet-oxford dark:text-fleet-tanVivid" /> Automated Alerts & Notifications</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-fleet-oxford dark:text-fleet-tanVivid" /> Multi-Region Support</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-fleet-oxford dark:text-fleet-tanVivid" /> Export Reports & CSV</p>
          </div>
        </div>

        <div className="rounded-3xl border border-fleet-tan/50 bg-fleet-cream/80 p-8 text-fleet-oxford shadow-xl shadow-fleet-oxford/10 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/65 dark:text-slate-100 dark:shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-wider text-fleet-oxford/80 dark:text-fleet-tanVivid">Hackathon Focus</p>
          <h4 className="mt-2 text-2xl font-bold">Built for Demo Impact</h4>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Optimized for live presentation: clear workflows, fast actions, and role-based control for Manager, Dispatcher, Safety, and Finance.
          </p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-xl border border-fleet-tan/40 bg-fleet-tan/25 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm font-semibold">Live KPIs + Role-based Views</p>
            </div>
            <div className="rounded-xl border border-fleet-tan/40 bg-fleet-tan/25 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm font-semibold">Trip, Vehicle, Driver, Maintenance, Fuel, Analytics</p>
            </div>
            <div className="rounded-xl border border-fleet-tan/40 bg-fleet-tan/25 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm font-semibold">CSV/PDF Export Ready for Judges</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-fleet-tan/60 bg-fleet-cream/80 py-6 text-fleet-oxford dark:border-slate-700/60 dark:bg-slate-900/65 dark:text-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <span className="rounded-lg bg-fleet-tan px-2 py-1 text-sm text-fleet-oxford">🚚</span>
            FleetFlow
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">© 2026 FleetFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
