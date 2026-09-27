import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Table from '../components/ui/Table';

const VehicleRegistryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const canManageVehicles = true;

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles');
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setVehicles(list);
    } catch (err) {
      console.error('Failed fetching vehicles in registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const toggleOutOfService = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/out-of-service`);
      toast.info('Vehicle status updated');
      fetchVehicles();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Update failed');
    }
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete blocked');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Vehicle Registry</h1>
          <p className="section-subtitle">Manage fleet lifecycle and availability</p>
        </div>
        {canManageVehicles ? <Button onClick={() => navigate('/vehicles/create')}>Add Vehicle</Button> : null}
      </div>

      {loading && <Loader text="Loading vehicles" />}

      <Table
        title="Fleet Vehicles"
        description="Operational status and lifecycle controls"
        loading={loading}
        columns={[
          { key: 'makeModel', label: 'Model', render: (row) => row.makeModel || row.model || 'Heavy Fleet Truck' },
          { key: 'registration', label: 'Plate', render: (row) => row.registration || row.registrationNumber || row.licensePlate },
          { key: 'type', label: 'Type', render: (row) => row.type || row.vehicle_type || 'Truck' },
          { key: 'odometer', label: 'Odometer', render: (row) => `${(row.odometer || 120000).toLocaleString()} km` },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          ...(canManageVehicles
            ? [
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (row) => (
                    <div className="flex gap-2">
                      <Button variant="secondary" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => toggleOutOfService(row.id || row._id)}>
                        Toggle OOS
                      </Button>
                      <Button variant="danger" className="!rounded-xl !px-2.5 !py-1.5" onClick={() => setDeleteId(row.id || row._id)}>
                        Delete
                      </Button>
                    </div>
                  )
                }
              ]
            : [])
        ]}
        rows={vehicles}
        getRowId={(row) => row.id || row._id}
        searchKeys={['makeModel', 'model', 'registration', 'licensePlate', 'status', 'type']}
      />

      <Modal open={Boolean(deleteId) && canManageVehicles} onClose={() => setDeleteId(null)} title="Delete vehicle" description="This action cannot be undone.">
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteVehicle(deleteId);
              setDeleteId(null);
            }}
          >
            Confirm delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VehicleRegistryPage;
