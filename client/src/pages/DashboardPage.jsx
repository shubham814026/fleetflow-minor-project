import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LuPackageOpen, LuShieldAlert, LuTruck, LuWaves } from 'react-icons/lu';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import Loader from '../components/Loader';
import StatusBadge from '../components/ui/StatusBadge';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = Number(value) || 0;
    let frame = 0;
    const maxFrames = 24;
    const timer = setInterval(() => {
      frame += 1;
      const progress = frame / maxFrames;
      setDisplay(Math.round(end * progress));
      if (frame >= maxFrames) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
      {display}
      {suffix}
    </p>
  );
};

const DashboardPage = () => {
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get('/dashboard', { params: filters });
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filters.type, filters.status]);

  const vehicles = data?.vehicles || [];
  const utilization = Number(data?.kpis?.utilizationRate || 0);
  const utilizationData = [{ name: 'Utilization', value: utilization, fill: '#002147' }];

  const statusDistribution = useMemo(() => {
    const total = vehicles.length || 1;
    const availableCount = vehicles.filter((item) => item.status === 'Available').length;
    const onTripCount = vehicles.filter((item) => item.status === 'On Trip').length;
    const inShopCount = vehicles.filter((item) => item.status === 'In Shop').length;

    return [
      { label: 'Available', count: availableCount, progress: Math.round((availableCount / total) * 100), color: 'bg-fleet-tan' },
      { label: 'On Trip', count: onTripCount, progress: Math.round((onTripCount / total) * 100), color: 'bg-fleet-oxford' },
      { label: 'In Shop', count: inShopCount, progress: Math.round((inShopCount / total) * 100), color: 'bg-amber-500' }
    ];
  }, [vehicles]);

  if (loading || !data) return <Loader text="Loading dashboard" />;

  const cards = [
    { label: 'Active Fleet', value: data?.kpis?.activeFleet || 0, icon: LuTruck },
    { label: 'Maintenance Alerts', value: data?.kpis?.maintenanceAlerts || 0, icon: LuShieldAlert },
    { label: 'Pending Cargo', value: data?.kpis?.pendingCargo || 0, icon: LuPackageOpen },
    { label: 'Utilization Rate', value: data?.kpis?.utilizationRate || 0, icon: LuWaves, suffix: '%' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="section-title">Command Center</h1>
        <p className="section-subtitle">Fleet KPIs and current operational status</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} glow>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                <AnimatedCounter value={card.value} suffix={card.suffix} />
              </div>
              <span className="rounded-xl border border-fleet-tan/70 bg-fleet-tan/30 p-2 text-fleet-oxford dark:border-fleet-tanVivid/60 dark:bg-fleet-oxford/30 dark:text-fleet-tanVivid">
                <card.icon />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Fleet Status Distribution</h3>
          <div className="mt-4 space-y-3">
            {statusDistribution.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.label}</span>
                  <span>{item.count} ({item.progress}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-2 rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Fleet Utilization</h3>
          <div className="mt-2 h-40 w-full">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={utilizationData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="-mt-1 text-center text-lg font-semibold text-fleet-oxford dark:text-fleet-tanVivid">{utilization}%</p>
        </Card>
      </div>

      <Table
        title="Active Fleet"
        description="Filter and review live vehicle readiness"
        loading={loading}
        columns={[
          { key: 'model', label: 'Model' },
          { key: 'licensePlate', label: 'Plate' },
          { key: 'type', label: 'Type' },
          { key: 'maxLoadCapacity', label: 'Capacity' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
        ]}
        rows={vehicles}
        getRowId={(row) => row._id}
        searchKeys={['model', 'licensePlate', 'type', 'status']}
        filters={
          <>
            <select className="input h-10 !w-36 !py-0" value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}>
              <option value="">All Types</option>
              <option>Truck</option>
              <option>Van</option>
              <option>Pickup</option>
              <option>Trailer</option>
              <option>Reefer</option>
              <option>Other</option>
            </select>
            <select className="input h-10 !w-36 !py-0" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="">All Status</option>
              <option>Available</option>
              <option>On Trip</option>
              <option>In Shop</option>
              <option>Out of Service</option>
            </select>
          </>
        }
      />
    </div>
  );
};

export default DashboardPage;
