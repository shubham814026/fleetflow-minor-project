import { useEffect, useState } from 'react';
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
  liters: '',
  cost: '',
  date: ''
};

const FuelCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const createFuelLog = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/fuel', {
        ...form,
        liters: Number(form.liters),
        cost: Number(form.cost),
        date: new Date(form.date)
      });
      toast.success('Fuel log added');
      setForm(initialForm);
      navigate('/expenses');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add fuel log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Add Fuel Record</h1>
          <p className="section-subtitle">Create a fuel expense entry</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/expenses')}>
          Back to Expenses
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading vehicles" />
      ) : (
        <Card>
          <form onSubmit={createFuelLog} className="grid gap-3 md:grid-cols-4">
            <FloatingSelect label="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.model} ({vehicle.licensePlate})
                </option>
              ))}
            </FloatingSelect>
            <FloatingInput type="number" min="0.1" step="0.1" label="Liters" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} required />
            <FloatingInput type="number" min="0" step="0.01" label="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
            <FloatingInput type="date" label="Date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <div className="md:col-span-4 flex justify-end">
              <Button disabled={submitting}>{submitting ? 'Adding...' : 'Add Fuel Record'}</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default FuelCreatePage;
