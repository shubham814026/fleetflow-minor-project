import { TRIPS } from './tripController.js';

export const getLogbookReport = async (req, res) => {
  return res.json({ success: true, data: TRIPS });
};

export const exportLogbookPDF = async (req, res) => {
  // Stream PDF headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="smartfleet_logbook.pdf"');
  
  // Dummy PDF binary buffer stream for backend verification
  const dummyPDF = Buffer.from('%PDF-1.4 ... SmartFleet AI Logbook Report Buffer ...', 'utf-8');
  return res.send(dummyPDF);
};

export const exportLogbookExcel = async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="smartfleet_logbook.csv"');

  let csv = 'TripCode,Driver,Vehicle,Origin,Destination,DistanceKm,DurationHours,Status\n';
  INITIAL_TRIPS.forEach((t) => {
    csv += `${t.tripCode},${t.driverName},${t.vehicleReg},"${t.origin}","${t.destination}",${t.distanceKm},${t.durationHours},${t.status}\n`;
  });

  return res.send(csv);
};
