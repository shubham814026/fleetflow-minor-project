import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../services/api';
import Loader from '../components/Loader';
import { exportAnalyticsToPdf, exportToCsv } from '../utils/csv';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { formatINRCurrency } from '../utils/currency';

ChartJS.register(LineElement, PointElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip, Filler);

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});

const formatCompactNumber = (value) => {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) return '0';
  return compactNumberFormatter.format(numericValue);
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateWindow, setDateWindow] = useState('30');
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/analytics');
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <Loader text="Loading analytics" />;

  const totalRevenue = analytics.rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
  const totalFuel = analytics.rows.reduce((sum, row) => sum + Number(row.fuelCost || 0), 0);
  const avgRoi = analytics.rows.length
    ? analytics.rows.reduce((sum, row) => sum + Number(row.roi || 0), 0) / analytics.rows.length
    : 0;

  const barData = {
    labels: analytics.chartData.labels,
    datasets: [
      {
        label: 'Fuel Efficiency (km/L)',
        data: analytics.chartData.fuelEfficiency,
        backgroundColor: '#002147'
      },
      {
        label: 'ROI (%)',
        data: analytics.chartData.roi,
        backgroundColor: '#d2b48c'
      }
    ]
  };

  const lineData = {
    labels: analytics.chartData.labels,
    datasets: [
      {
        label: 'Fuel Efficiency (km/L)',
        data: analytics.chartData.fuelEfficiency,
        borderColor: '#002147',
        backgroundColor: 'rgba(210, 180, 140, 0.25)',
        fill: true,
        tension: 0.35
      }
    ]
  };

  const xTickLimit = analytics.chartData.labels.length > 20 ? 6 : 10;

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const seriesLabel = context.dataset.label || '';
            const value = Number(context.parsed.y || 0);

            if (seriesLabel.includes('ROI')) {
              return `${seriesLabel}: ${value.toFixed(2)}%`;
            }

            if (seriesLabel.includes('Fuel Efficiency')) {
              return `${seriesLabel}: ${value.toFixed(2)} km/L`;
            }

            return `${seriesLabel}: ${formatCompactNumber(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: xTickLimit,
          maxRotation: 0,
          minRotation: 0
        }
      },
      y: {
        ticks: {
          callback: (tickValue) => formatCompactNumber(tickValue)
        }
      }
    }
  };

  const lineOptions = {
    ...baseChartOptions,
    elements: {
      point: {
        radius: analytics.chartData.labels.length > 30 ? 1.5 : 2.5,
        hoverRadius: 4
      },
      line: {
        borderWidth: 2
      }
    }
  };

  const barOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      x: {
        ...baseChartOptions.scales.x,
        ticks: {
          ...baseChartOptions.scales.x.ticks,
          maxTicksLimit: xTickLimit
        }
      },
      y: {
        ...baseChartOptions.scales.y,
        beginAtZero: true,
        ticks: {
          callback: (tickValue) => formatCompactNumber(tickValue)
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Analytics & ROI</h1>
          <p className="section-subtitle">Fuel efficiency and profitability trends</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input !h-10 !w-36 !py-0" value={dateWindow} onChange={(e) => setDateWindow(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button onClick={() => exportToCsv('fleetflow-analytics.csv', analytics.rows)}>Export CSV</Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const lineChartImage = lineChartRef.current?.toBase64Image?.();
              const barChartImage = barChartRef.current?.toBase64Image?.();

              await exportAnalyticsToPdf('fleetflow-analytics-report.pdf', {
                rows: analytics.rows,
                dateWindow,
                totalRevenue,
                totalFuel,
                avgRoi,
                chartImages: [lineChartImage, barChartImage].filter(Boolean)
              });
            }}
          >
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card glow>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-fleet-oxford dark:text-fleet-tanVivid">{formatINRCurrency(totalRevenue)}</p>
        </Card>
        <Card glow>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Fuel Cost</p>
          <p className="mt-2 text-3xl font-semibold text-fleet-oxford dark:text-fleet-tanVivid">{formatINRCurrency(totalFuel)}</p>
        </Card>
        <Card glow>
          <p className="text-sm text-slate-500 dark:text-slate-400">Average ROI</p>
          <p className="mt-2 text-3xl font-semibold text-fleet-oxford dark:text-fleet-tanVivid">{(avgRoi * 100).toFixed(2)}%</p>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="h-80">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Efficiency trend</p>
          <div className="mt-3 h-64">
            <Line ref={lineChartRef} data={lineData} options={lineOptions} />
          </div>
        </Card>
        <Card className="h-80">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Fuel vs ROI</p>
          <div className="mt-3 h-64">
            <Bar ref={barChartRef} data={barData} options={barOptions} />
          </div>
        </Card>
      </div>

      <Table
        title="Detailed ROI Table"
        description={`Window: last ${dateWindow} days`}
        loading={loading}
        columns={[
          { key: 'vehicle', label: 'Vehicle' },
          { key: 'distanceKm', label: 'Distance (km)' },
          { key: 'liters', label: 'Liters' },
          { key: 'fuelEfficiency', label: 'Fuel Efficiency', render: (row) => `${Number(row.fuelEfficiency || 0).toFixed(2)} km/L` },
          { key: 'fuelCost', label: 'Fuel Cost', render: (row) => formatINRCurrency(row.fuelCost) },
          { key: 'maintenanceCost', label: 'Maintenance', render: (row) => formatINRCurrency(row.maintenanceCost) },
          { key: 'revenue', label: 'Revenue', render: (row) => formatINRCurrency(row.revenue) },
          { key: 'roi', label: 'ROI', render: (row) => `${(row.roi * 100).toFixed(2)}%` }
        ]}
        rows={analytics.rows}
        getRowId={(row) => row.vehicleId}
        searchKeys={['vehicle']}
      />
    </div>
  );
};

export default AnalyticsPage;
