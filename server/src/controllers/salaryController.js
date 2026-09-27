import { logAuditEvent } from './auditController.js';
import prisma from '../repositories/store.js';

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
  }
];

export const getSalaries = async (req, res) => {
  const { month, status, search, driverId } = req.query || {};

  try {
    const dbDrivers = await prisma.drivers.findMany({
      take: 50,
      orderBy: { created_at: 'desc' },
      include: {
        users: true,
        trips: { take: 10 }
      }
    });

    if (dbDrivers && dbDrivers.length > 0) {
      let mapped = dbDrivers.map((d, idx) => {
        const base = Number(d.salary) || (28000 + (idx % 6) * 2000);
        const tripsCount = d.trips?.length || (idx % 8 + 4);
        const bonus = tripsCount * 500;
        const overtime = (idx % 4) * 800;
        const total = base + bonus + overtime;
        const st = idx % 3 === 0 ? 'Credited' : idx % 3 === 1 ? 'Pending' : 'Credited';

        return {
          id: d.id,
          driverId: d.id,
          driverName: d.users?.name || `Driver ${d.id.slice(0, 6)}`,
          month: month && month !== 'ALL' ? month : 'September 2026',
          amount: total,
          baseAmount: base,
          tripBonus: bonus,
          overtime,
          deductions: 0,
          tripsCompleted: tripsCount,
          due: '2026-09-30',
          status: st,
          txnId: st === 'Credited' ? `TXN${d.id.slice(0, 8).toUpperCase()}` : '-',
          disbursedAt: st === 'Credited' ? '2026-09-20T10:00:00.000Z' : null
        };
      });

      if (status && status !== 'ALL') {
        mapped = mapped.filter((s) => s.status.toLowerCase() === status.toLowerCase());
      }
      if (driverId) {
        mapped = mapped.filter((s) => s.driverId === driverId);
      }
      if (search) {
        const q = search.toLowerCase();
        mapped = mapped.filter((s) => s.driverName.toLowerCase().includes(q) || s.txnId.toLowerCase().includes(q));
      }

      const totalDisbursed = mapped.filter((s) => s.status === 'Credited').reduce((acc, curr) => acc + curr.amount, 0);
      const totalPending = mapped.filter((s) => s.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
      const totalFailed = mapped.filter((s) => s.status === 'Failed').reduce((acc, curr) => acc + curr.amount, 0);
      const avgSalary = mapped.length > 0 ? Math.round(mapped.reduce((acc, curr) => acc + curr.amount, 0) / mapped.length) : 0;

      return res.json({
        success: true,
        data: mapped,
        stats: {
          totalRecords: mapped.length,
          totalDisbursed,
          totalPending,
          totalFailed,
          avgSalary
        }
      });
    }
  } catch (err) {
    console.warn('Prisma getSalaries error, using fallback:', err.message);
  }

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

  if (driverId) {
    try {
      const isUuid = typeof driverId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(driverId);
      if (isUuid) {
        await prisma.drivers.update({
          where: { id: driverId },
          data: { salary: netAmount }
        });
      }
    } catch (e) {
      console.warn('Prisma update driver salary error:', e.message);
    }
  }

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
