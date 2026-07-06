import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingInput from '../components/ui/FloatingInput';
import FloatingSelect from '../components/ui/FloatingSelect';

const initialForm = {
  name: '',
  licenseNumber: '',
  licenseExpiryDate: '',
  status: '',
  safetyScore: ''
};

const DriverCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const createDriver = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        licenseNumber: form.licenseNumber,
        licenseExpiryDate: new Date(form.licenseExpiryDate),
        safetyScore: Number(form.safetyScore || 100)
      };

      if (form.status) {
        payload.status = form.status;
      }

      await api.post('/drivers', {
        ...payload
      });
      toast.success('Driver created');
      setForm(initialForm);
      navigate('/drivers');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Add Driver</h1>
          <p className="section-subtitle">Create a new driver profile</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/drivers')}>
          Back to Drivers
        </Button>
      </div>

      <Card>
        <form onSubmit={createDriver} className="grid gap-3 md:grid-cols-3">
          <FloatingInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FloatingInput label="License Number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
          <FloatingInput type="date" label="License Expiry" value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} required />
          <FloatingSelect
            label="Status"
            placeholder="Select Status (optional)"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>On Duty</option>
            <option>Off Duty</option>
            <option>Suspended</option>
          </FloatingSelect>
          <FloatingInput type="number" min="0" max="100" label="Safety Score" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
          <div className="flex items-end">
            <Button className="w-full" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Driver'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DriverCreatePage;
