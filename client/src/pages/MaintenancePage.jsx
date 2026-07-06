import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Table from '../components/ui/Table';
import { formatINRCurrency } from '../utils/currency';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const canManageMaintenance = user?.role === 'Fleet Manager' || user?.role === 'Safety Officer';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logRes] = await Promise.all([api.get('/maintenance')]);
      setLogs(logRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resolveLog = async (logId) => {
    try {
      await api.patch(`/maintenance/${logId}/resolve`);
      toast.info('Maintenance log resolved');
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Resolve failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Maintenance & Service Logs</h1>
          <p className="section-subtitle">Move vehicles in and out of service workflow</p>
        </div>
        {canManageMaintenance ? <Button onClick={() => navigate('/maintenance/create')}>Add to Service</Button> : null}
      </div>

      {loading && <Loader text="Loading maintenance logs" />}

      <Table
        title="Service Activity"
        description="Track in-shop time and maintenance resolution"
        loading={loading}
        columns={[
          { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle?.licensePlate || '-' },
          { key: 'serviceType', label: 'Service' },
          { key: 'serviceDate', label: 'Date', render: (row) => new Date(row.serviceDate).toLocaleDateString() },
          { key: 'cost', label: 'Cost', render: (row) => formatINRCurrency(row.cost) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.resolved ? 'Completed' : 'In Shop'} /> },
          {
            key: 'action',
            label: 'Action',
            render: (row) =>
              canManageMaintenance && !row.resolved ? (
                <Button variant="secondary" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => resolveLog(row._id)}>
                  Resolve
                </Button>
              ) : (
                <span className="text-xs text-slate-500">Resolved</span>
              )
          }
        ]}
        rows={logs}
        getRowId={(row) => row._id}
        searchKeys={['serviceType', 'notes']}
      />
    </div>
  );
};

export default MaintenancePage;
