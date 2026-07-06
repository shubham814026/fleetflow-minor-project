import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingInput from '../components/ui/FloatingInput';
import FloatingSelect from '../components/ui/FloatingSelect';

const initialTripForm = {
  referenceNo: '',
  origin: '',
  destination: '',
  cargoDescription: '',
  cargoWeight: '',
  plannedDistanceKm: '',
  revenue: '',
  vehicle: '',
  driver: '',
  status: ''
};

const TripCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(initialTripForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'Available' && !vehicle.outOfService),
    [vehicles]
  );

  const availableDrivers = useMemo(() => {
    const now = new Date();
    return drivers.filter(
      (driver) =>
        driver.status !== 'Suspended' &&
        driver.status !== 'On Trip' &&
        new Date(driver.licenseExpiryDate) >= now
    );
  }, [drivers]);

  useEffect(() => {
    const fetchLookups = async () => {
      setLoading(true);
      try {
        const [vehicleRes, driverRes] = await Promise.all([api.get('/vehicles'), api.get('/drivers')]);
        setVehicles(vehicleRes.data);
        setDrivers(driverRes.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchLookups();
  }, [toast]);

  const createTrip = async (event) => {
    event.preventDefault();

    const selectedVehicle = vehicles.find((vehicle) => vehicle._id === form.vehicle);
    if (selectedVehicle && Number(form.cargoWeight) > Number(selectedVehicle.maxLoadCapacity)) {
      toast.error('Cargo weight exceeds vehicle max load capacity');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        referenceNo: form.referenceNo,
        origin: form.origin,
        destination: form.destination,
        cargoDescription: form.cargoDescription,
        cargoWeight: Number(form.cargoWeight),
        plannedDistanceKm: Number(form.plannedDistanceKm),
        revenue: Number(form.revenue || 0),
        vehicle: form.vehicle,
        driver: form.driver
      };

      if (form.status) {
        payload.status = form.status;
      }

      await api.post('/trips', {
        ...payload
      });
      toast.success('Trip created');
      navigate('/trips');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Trip creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Create Trip</h1>
          <p className="section-subtitle">Fill in trip details and dispatch setup</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/trips')}>
          Back to Trips
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading form data" />
      ) : (
        <Card>
          <form onSubmit={createTrip} className="grid gap-3 md:grid-cols-3">
            <FloatingInput label="Reference No" value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} required />
            <FloatingInput label="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
            <FloatingInput label="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
            <FloatingInput label="Cargo Description" value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} />
            <FloatingInput type="number" min="1" label="Cargo Weight" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} required />
            <FloatingInput type="number" min="1" label="Planned Distance (km)" value={form.plannedDistanceKm} onChange={(e) => setForm({ ...form, plannedDistanceKm: e.target.value })} required />
            <FloatingInput type="number" min="0" label="Revenue" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />

            <FloatingSelect label="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
              <option value="">Select Available Vehicle</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.model} ({vehicle.licensePlate})
                </option>
              ))}
            </FloatingSelect>

            <FloatingSelect label="Driver" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required>
              <option value="">Select Available Driver</option>
              {availableDrivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name}
                </option>
              ))}
            </FloatingSelect>

            <FloatingSelect
              className="md:col-span-2"
              label="Trip Status"
              placeholder="Select Trip Status (optional)"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Draft</option>
              <option>Dispatched</option>
            </FloatingSelect>

            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default TripCreatePage;
