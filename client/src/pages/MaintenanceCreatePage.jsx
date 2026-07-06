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
    () => vehicles.filter((vehicle) => vehicle.status !== 'On Trip' && vehicle.status !== 'Out of Service'),
    [vehicles]
  );

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/vehicles');
        setVehicles(data);
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
      await api.post('/maintenance', {
        ...form,
        cost: Number(form.cost),
        serviceDate: new Date(form.serviceDate)
      });
      toast.success('Maintenance log created and vehicle moved to shop');
      setForm(initialForm);
      navigate('/maintenance');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create maintenance log');
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
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.model} ({vehicle.licensePlate})
                </option>
              ))}
            </FloatingSelect>
            <FloatingInput label="Service Type" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required />
            <FloatingInput type="date" label="Service Date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} required />
            <FloatingInput type="number" min="0" label="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
            <FloatingInput className="md:col-span-2" label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex items-end">
              <Button className="w-full" disabled={submitting}>
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
