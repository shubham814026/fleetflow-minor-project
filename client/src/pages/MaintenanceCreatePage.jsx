import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingInput from '../components/ui/FloatingInput';
import FloatingSelect from '../components/ui/FloatingSelect';

const initialForm = {
  vehicle: '',
  serviceType: '',
  notes: '',
  cost: '',
  serviceDate: ''
};

const MaintenanceCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const serviceableVehicles = useMemo(
    () => (Array.isArray(vehicles) ? vehicles : []).filter((vehicle) => {
      const s = (vehicle.status || '').toLowerCase();
      return s !== 'on trip' && s !== 'on_trip' && s !== 'out of service' && s !== 'out_of_service';
    }),
    [vehicles]
  );

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await api.get('/vehicles');
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setVehicles(list);
        if (list.length > 0) {
          const firstAvailable = list.find((v) => {
            const s = (v.status || '').toLowerCase();
            return s !== 'on trip' && s !== 'on_trip' && s !== 'out of service' && s !== 'out_of_service';
          }) || list[0];
          setForm((prev) => ({ ...prev, vehicle: firstAvailable.id || firstAvailable._id || firstAvailable.registration || firstAvailable.registrationNumber }));
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [toast]);

  const createLog = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const selectedVeh = vehicles.find((v) => v.id === form.vehicle || v._id === form.vehicle || v.registration === form.vehicle || v.registrationNumber === form.vehicle);

      await api.post('/maintenance', {
        vehicleId: selectedVeh?.id || form.vehicle,
        vehicleReg: selectedVeh?.registration || selectedVeh?.registrationNumber,
        serviceType: form.serviceType,
        notes: form.notes,
        cost: Number(form.cost),
        serviceDate: form.serviceDate ? new Date(form.serviceDate).toISOString() : new Date().toISOString()
      });
      toast.success('Maintenance log created and vehicle moved to shop');
      setForm(initialForm);
      navigate('/maintenance');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add maintenance log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Add to Service</h1>
          <p className="section-subtitle">Create a maintenance/service record</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/maintenance')}>
          Back to Service Logs
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading vehicles" />
      ) : (
        <Card>
          <form onSubmit={createLog} className="grid gap-3 md:grid-cols-3">
            <FloatingSelect label="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
              <option value="">Select Vehicle</option>
              {serviceableVehicles.map((vehicle) => (
                <option key={vehicle.id || vehicle._id} value={vehicle.id || vehicle._id}>
                  {vehicle.registration || vehicle.registrationNumber || vehicle.licensePlate || 'Vehicle'} - {vehicle.makeModel || vehicle.model || 'Truck'}
                </option>
              ))}
            </FloatingSelect>
            <FloatingInput label="Service Type" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required />
            <FloatingInput type="date" label="Service Date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} required />
            <FloatingInput type="number" min="0" label="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
            <FloatingInput className="md:col-span-2" label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add to Service'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default MaintenanceCreatePage;
