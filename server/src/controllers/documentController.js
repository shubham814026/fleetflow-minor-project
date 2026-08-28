let DOCUMENTS = [
  { id: 'doc-1', title: 'Driving Licence - Rajesh Kumar', type: 'Licence', entity: 'Driver drv-201', expiryDate: '2028-04-14', status: 'Valid' },
  { id: 'doc-2', title: 'Vehicle Insurance - KA-01-EQ-9042', type: 'Insurance', entity: 'Vehicle veh-101', expiryDate: '2026-11-20', status: 'Valid' },
  { id: 'doc-3', title: 'PUC Certificate - MH-12-PQ-4821', type: 'PUC', entity: 'Vehicle veh-102', expiryDate: '2026-09-05', status: 'Expiring Soon' },
  { id: 'doc-4', title: 'Driving Licence - Venkatesh R', type: 'Licence', entity: 'Driver drv-204', expiryDate: '2026-06-30', status: 'Expired' }
];

export const getDocuments = async (req, res) => {
  return res.json({ success: true, data: DOCUMENTS });
};

export const createDocument = async (req, res) => {
  const body = req.body;
  const newD = { id: `doc-${Date.now()}`, ...body };
  DOCUMENTS.unshift(newD);
  return res.status(201).json({ success: true, data: newD });
};
