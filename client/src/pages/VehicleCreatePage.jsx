import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingInput from '../components/ui/FloatingInput';
import FloatingSelect from '../components/ui/FloatingSelect';

const initialForm = {
  model: '',
  type: '',
  licensePlate: '',
  maxLoadCapacity: '',
  acquisitionCost: '',
  odometer: ''
};

const VehicleCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.model || !form.licensePlate || !form.maxLoadCapacity || !form.odometer) {
      setFormError('Please complete required fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        model: form.model,
        licensePlate: form.licensePlate,
        maxLoadCapacity: Number(form.maxLoadCapacity),
        acquisitionCost: Number(form.acquisitionCost || 0),
        odometer: Number(form.odometer)
      };

      if (form.type) {
        payload.type = form.type;
      }

      await api.post('/vehicles', {
        ...payload
      });
      toast.success('Vehicle created');
      setForm(initialForm);
      navigate('/vehicles');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Add Vehicle</h1>
          <p className="section-subtitle">Create a new fleet vehicle record</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/vehicles')}>
          Back to Vehicles
        </Button>
      </div>

      <Card>
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-3">
          <FloatingInput label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <FloatingSelect
            label="Type"
            placeholder="Select Type (optional)"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>Truck</option>
            <option>Van</option>
            <option>Pickup</option>
            <option>Trailer</option>
            <option>Reefer</option>
            <option>Other</option>
          </FloatingSelect>
          <FloatingInput label="License Plate" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
          <FloatingInput type="number" min="1" label="Max Load Capacity" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })} />
          <FloatingInput type="number" min="0" label="Acquisition Cost" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
          <FloatingInput type="number" min="0" label="Odometer" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          <div className="md:col-span-3 flex items-center justify-between">
            {formError ? (
              <motion.p initial={{ x: -8 }} animate={{ x: [0, -6, 6, -4, 4, 0] }} className="text-xs text-rose-500">
                {formError}
              </motion.p>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">Records sync instantly with backend APIs.</span>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VehicleCreatePage;
