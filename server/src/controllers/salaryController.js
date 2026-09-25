import { logAuditEvent } from './auditController.js';

// Pre-seeded dynamic driver payroll records
let SALARIES = [
  {
    id: 'sal-1',
    driverId: 'drv-201',
    driverName: 'Rajesh Kumar',
    month: 'September 2026',
    amount: 38500,
    baseAmount: 30000,
    tripBonus: 6500,
    overtime: 2000,
    deductions: 0,
    tripsCompleted: 14,
    due: '2026-09-30',
    status: 'Credited',
    txnId: 'TXN9982310293',
    disbursedAt: '2026-09-18T10:30:00.000Z'
  },
  {
    id: 'sal-2',
    driverId: 'drv-202',
    driverName: 'Sunil Patil',
    month: 'September 2026',
    amount: 34200,
    baseAmount: 28000,
    tripBonus: 4800,
    overtime: 1400,
    deductions: 0,
    tripsCompleted: 11,
    due: '2026-09-30',
    status: 'Pending',
    txnId: '-',
    disbursedAt: null
  },
  {
    id: 'sal-3',
    driverId: 'drv-203',
    driverName: 'Amit Singh',
    month: 'September 2026',
    amount: 41000,
    baseAmount: 32000,
    tripBonus: 7200,
    overtime: 1800,
    deductions: 0,
    tripsCompleted: 16,
    due: '2026-09-30',
    status: 'Credited',
    txnId: 'TXN8871293012',
    disbursedAt: '2026-09-19T14:15:00.000Z'
  },
  {
    id: 'sal-4',
    driverId: 'drv-204',
    driverName: 'Venkatesh R',
    month: 'September 2026',
    amount: 31500,
    baseAmount: 28000,
    tripBonus: 3500,
    overtime: 0,
    deductions: 0,
    tripsCompleted: 8,
    due: '2026-09-30',
    status: 'Failed',
    txnId: 'TXN4451293019',
    disbursedAt: null
  },
  {
    id: 'sal-5',
    driverId: 'drv-205',
    driverName: 'Harish Verma',
    month: 'September 2026',
    amount: 36000,
    baseAmount: 30000,
    tripBonus: 5000,
    overtime: 1000,
    deductions: 0,
    tripsCompleted: 12,
    due: '2026-09-30',
    status: 'Pending',
    txnId: '-',
    disbursedAt: null
  }
];

export const getSalaries = async (req, res) => {
  const { month, status, search, driverId } = req.query || {};
  let filtered = [...SALARIES];

  if (month && month !== 'ALL') {
    filtered = filtered.filter((s) => s.month.toLowerCase() === month.toLowerCase());
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((s) => s.status.toLowerCase() === status.toLowerCase());
  }

  if (driverId) {
    filtered = filtered.filter((s) => s.driverId === driverId);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.driverName.toLowerCase().includes(q) ||
        (s.txnId && s.txnId.toLowerCase().includes(q)) ||
        (s.driverId && s.driverId.toLowerCase().includes(q))
    );
  }

  // Calculate dynamic stats
  const totalDisbursed = filtered
    .filter((s) => s.status === 'Credited')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalPending = filtered
    .filter((s) => s.status === 'Pending')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalFailed = filtered
    .filter((s) => s.status === 'Failed')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const avgSalary = filtered.length > 0
    ? Math.round(filtered.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) / filtered.length)
    : 0;

  return res.json({
    success: true,
    data: filtered,
    stats: {
      totalRecords: filtered.length,
      totalDisbursed,
      totalPending,
      totalFailed,
      avgSalary
    }
  });
};

export const createSalary = async (req, res) => {
  const {
    driverId,
    driverName,
    month = 'September 2026',
    baseAmount = 30000,
    tripBonus = 0,
    overtime = 0,
    deductions = 0,
    tripsCompleted = 0,
    due
  } = req.body || {};

  if (!driverName) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Driver name is required' }
    });
  }

  const netAmount = Math.max(0, Number(baseAmount) + Number(tripBonus) + Number(overtime) - Number(deductions));

  const newSalary = {
    id: `sal-${Date.now()}`,
    driverId: driverId || `drv-${Math.floor(200 + Math.random() * 800)}`,
    driverName,
    month,
    amount: netAmount,
    baseAmount: Number(baseAmount),
    tripBonus: Number(tripBonus),
    overtime: Number(overtime),
    deductions: Number(deductions),
    tripsCompleted: Number(tripsCompleted),
    due: due || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
    txnId: '-',
    disbursedAt: null
  };

  SALARIES.unshift(newSalary);

  logAuditEvent({
    user: req.user?.email || 'admin@fleetflow.com',
    role: req.user?.role || 'ACCOUNTANT',
    action: 'Driver Payroll Entry Created',
    target: `${driverName} (${month}) - ₹${netAmount.toLocaleString()}`,
    ip: req.ip || '127.0.0.1'
  });

  return res.status(201).json({
    success: true,
    message: 'Driver payroll record generated successfully',
    data: newSalary
  });
};

export const updateSalaryStatus = async (req, res) => {
  const { id } = req.params;
  const { status, txnId } = req.body;

  let updated = null;
  SALARIES = SALARIES.map((s) => {
    if (s.id === id) {
      const isCredit = (status || s.status) === 'Credited';
      const generatedTxn = txnId || (isCredit ? `TXN${Date.now().toString().slice(-10)}` : s.txnId);
      updated = {
        ...s,
        status: status || s.status,
        txnId: generatedTxn,
        disbursedAt: isCredit ? new Date().toISOString() : s.disbursedAt
      };
      return updated;
    }
    return s;
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Salary record ${id} not found` }
    });
  }

  logAuditEvent({
    user: req.user?.email || 'admin@fleetflow.com',
    role: req.user?.role || 'ACCOUNTANT',
    action: `Salary Status Updated -> ${updated.status}`,
    target: `${updated.driverName} (${updated.month}) - ${updated.txnId}`,
    ip: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: `Salary status updated to ${updated.status}`,
    data: updated
  });
};

export const batchDisburse = async (req, res) => {
  const { ids } = req.body || {};
  let count = 0;

  SALARIES = SALARIES.map((s) => {
    if ((!ids || ids.includes(s.id)) && s.status !== 'Credited') {
      count++;
      return {
        ...s,
        status: 'Credited',
        txnId: `TXN${Date.now().toString().slice(-10)}${Math.floor(10 + Math.random() * 90)}`,
        disbursedAt: new Date().toISOString()
      };
    }
    return s;
  });

  logAuditEvent({
    user: req.user?.email || 'admin@fleetflow.com',
    role: req.user?.role || 'ACCOUNTANT',
    action: 'Batch Salary Disbursement',
    target: `Processed ${count} driver payouts`,
    ip: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: `Successfully disbursed ${count} salary records`,
    count
  });
};

export const deleteSalary = async (req, res) => {
  const { id } = req.params;
  const initialLen = SALARIES.length;
  const targetItem = SALARIES.find((s) => s.id === id);
  SALARIES = SALARIES.filter((s) => s.id !== id);

  if (SALARIES.length === initialLen) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Salary record ${id} not found` }
    });
  }

  logAuditEvent({
    user: req.user?.email || 'admin@fleetflow.com',
    role: req.user?.role || 'ACCOUNTANT',
    action: 'Salary Record Deleted',
    target: `${targetItem?.driverName || id} - ₹${targetItem?.amount || 0}`,
    ip: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: 'Salary record removed successfully'
  });
};
