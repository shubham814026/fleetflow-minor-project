import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Table from '../components/ui/Table';

const TripDispatcherPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const tripRes = await api.get('/trips');
      const list = tripRes.data?.data || (Array.isArray(tripRes.data) ? tripRes.data : []);
      setTrips(list);
    } catch (err) {
      console.error('Failed fetching trips in dispatcher:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateStatus = async (tripId, status) => {
    try {
      await api.patch(`/trips/${tripId}/status`, {
        status,
        actualDistanceKm: status === 'Completed' ? 120 : undefined
      });
      toast.info(`Trip marked ${status}`);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update trip');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Trip Dispatcher</h1>
          <p className="section-subtitle">Dispatch and track trip lifecycle</p>
        </div>
        <Button onClick={() => navigate('/trips/create')}>Create Trip</Button>
      </div>

      {loading && <Loader text="Loading trips" />}

      <Table
        title="Trip Lifecycle"
        description="Dispatch actions and real-time status"
        loading={loading}
        columns={[
          { key: 'tripCode', label: 'Ref', render: (row) => row.tripCode || row.referenceNo || 'TRP-' + (row.id ? row.id.slice(0, 6) : '') },
          { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicleReg || row.vehicle?.licensePlate || row.vehicle?.registration || '-' },
          { key: 'driver', label: 'Driver', render: (row) => row.driverName || row.driver?.name || '-' },
          { key: 'route', label: 'Route', render: (row) => `${row.origin || 'Depot'} → ${row.destination || 'Terminal'}` },
          { key: 'distanceKm', label: 'Distance', render: (row) => `${row.distanceKm || 120} km` },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="flex gap-2">
                {row.status !== 'In Transit' && row.status !== 'Dispatched' && row.status !== 'Completed' && (
                  <Button variant="secondary" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => updateStatus(row.id || row._id, 'Dispatched')}>
                    Dispatch
                  </Button>
                )}
                {(row.status === 'In Transit' || row.status === 'Dispatched') && (
                  <Button variant="secondary" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => updateStatus(row.id || row._id, 'Completed')}>
                    Complete
                  </Button>
                )}
                {row.status !== 'Completed' && row.status !== 'Cancelled' && (
                  <Button variant="danger" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => updateStatus(row.id || row._id, 'Cancelled')}>
                    Cancel
                  </Button>
                )}
              </div>
            )
          }
        ]}
        rows={trips}
        getRowId={(row) => row.id || row._id}
        searchKeys={['tripCode', 'vehicleReg', 'driverName', 'origin', 'destination', 'status']}
      />
    </div>
  );
};

export default TripDispatcherPage;
