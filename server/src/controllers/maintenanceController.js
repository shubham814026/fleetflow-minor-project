let MAINTENANCE_RECORDS = [
  { id: 'm-1', vehicleReg: 'KA-01-EQ-9042', serviceType: 'Engine Oil & Filter', lastServiceDate: '2026-05-10', nextServiceDate: '2026-09-10', odometer: 142500, status: 'Due Soon' },
  { id: 'm-2', vehicleReg: 'MH-12-PQ-4821', serviceType: 'Tire Alignment & Rotation', lastServiceDate: '2026-02-15', nextServiceDate: '2026-08-15', odometer: 89400, status: 'Overdue' },
  { id: 'm-3', vehicleReg: 'DL-01-AB-1234', serviceType: 'Brake Pad Replacement', lastServiceDate: '2026-07-01', nextServiceDate: '2026-11-01', odometer: 64200, status: 'Due' }
];

export const getMaintenanceRecords = async (req, res) => {
  return res.json({ success: true, data: MAINTENANCE_RECORDS });
};

export const createMaintenanceRecord = async (req, res) => {
  const body = req.body;
  const newM = { id: `m-${Date.now()}`, ...body };
  MAINTENANCE_RECORDS.unshift(newM);
  return res.status(201).json({ success: true, data: newM });
};
