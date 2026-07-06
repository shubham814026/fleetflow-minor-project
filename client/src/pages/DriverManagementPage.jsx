import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Table from '../components/ui/Table';

const DriverManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const canManageDrivers = user?.role === 'Fleet Manager' || user?.role === 'Safety Officer';

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/drivers');
      setDrivers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const removeDriver = async (id) => {
    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver deleted');
      fetchDrivers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete blocked');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Driver Management</h1>
          <p className="section-subtitle">Compliance status, safety score and trip readiness</p>
        </div>
        {canManageDrivers ? <Button onClick={() => navigate('/drivers/create')}>Add Driver</Button> : null}
      </div>

      {loading && <Loader text="Loading drivers" />}

      <Table
        title="Driver Roster"
        description="Safety posture and readiness status"
        loading={loading}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'licenseExpiryDate', label: 'License Expiry', render: (row) => new Date(row.licenseExpiryDate).toLocaleDateString() },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'safetyScore', label: 'Safety Score' },
          { key: 'completionRate', label: 'Completion Rate', render: (row) => `${row.completionRate || 0}%` },
          ...(canManageDrivers
            ? [
                {
                  key: 'action',
                  label: 'Action',
                  render: (row) => (
                    <Button variant="danger" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => removeDriver(row._id)}>
                      Delete
                    </Button>
                  )
                }
              ]
            : [])
        ]}
        rows={drivers}
        getRowId={(row) => row._id}
        searchKeys={['name', 'licenseNumber', 'status']}
      />
    </div>
  );
};

export default DriverManagementPage;
