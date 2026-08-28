import { DEMO_SALARIES } from '../../../client/src/api/mockData.js';

let SALARIES = [...DEMO_SALARIES];

export const getSalaries = async (req, res) => {
  return res.json({ success: true, data: SALARIES });
};

export const updateSalaryStatus = async (req, res) => {
  const { id } = req.params;
  const { status, txnId } = req.body;

  let updated = null;
  SALARIES = SALARIES.map((s) => {
    if (s.id === id) {
      updated = {
        ...s,
        status: status || 'Credited',
        txnId: txnId || `TXN${Date.now().toString().slice(-8)}`
      };
      return updated;
    }
    return s;
  });

  return res.json({ success: true, data: updated });
};
