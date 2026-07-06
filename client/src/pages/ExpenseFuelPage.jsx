import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingSelect from '../components/ui/FloatingSelect';
import Table from '../components/ui/Table';
import { formatINRCurrency } from '../utils/currency';

const ExpenseFuelPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [costSummary, setCostSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehicleRes, logRes] = await Promise.all([api.get('/vehicles'), api.get('/fuel')]);
      setVehicles(vehicleRes.data);
      setLogs(logRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchCosts = async (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId) {
      setCostSummary(null);
      return;
    }

    try {
      const { data } = await api.get(`/fuel/cost/${vehicleId}`);
      setCostSummary(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load cost summary');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Expense & Fuel Logging</h1>
          <p className="section-subtitle">Track liters, cost, and operational totals</p>
        </div>
        <Button onClick={() => navigate('/expenses/create')}>Add Fuel Record</Button>
      </div>

      <Card className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" glow>
        <div className="lg:col-span-2">
          <FloatingSelect label="Operational Cost by Vehicle" value={selectedVehicleId} onChange={(e) => fetchCosts(e.target.value)}>
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.model} ({vehicle.licensePlate})
              </option>
            ))}
          </FloatingSelect>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fuel Cost</p>
          <p className="mt-2 text-2xl font-semibold text-fleet-oxford dark:text-fleet-tanVivid">
            {formatINRCurrency(costSummary ? costSummary.totalFuelCost : 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Operational Cost</p>
          <p className="mt-2 text-2xl font-semibold text-fleet-oxford dark:text-fleet-tanVivid">
            {formatINRCurrency(costSummary ? costSummary.totalOperationalCost : 0)}
          </p>
        </div>
      </Card>

      {loading && <Loader text="Loading fuel logs" />}

      <Table
        title="Fuel Logs"
        description="Cost tracking with searchable history"
        loading={loading}
        columns={[
          { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle?.licensePlate || '-' },
          { key: 'liters', label: 'Liters' },
          { key: 'cost', label: 'Cost', render: (row) => formatINRCurrency(row.cost) },
          { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() }
        ]}
        rows={logs}
        getRowId={(row) => row._id}
        searchKeys={['liters', 'cost']}
      />
    </div>
  );
};

export default ExpenseFuelPage;
