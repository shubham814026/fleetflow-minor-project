export const INITIAL_VEHICLES = [
  {
    id: 'veh-101',
    registration: 'KA-01-EQ-9042',
    makeModel: 'Tata Prima 4928.S',
    type: 'Heavy Truck',
    status: 'moving', // moving, idle, offline, sos, geofence_violation
    speed: 68,
    heading: 120,
    lat: 12.9716,
    lng: 77.5946,
    fuelLevel: 82,
    odometer: 142500,
    assignedDriverId: 'drv-201',
    assignedDriverName: 'Rajesh Kumar',
    purchaseDate: '2022-03-15',
    insuranceExpiry: '2026-11-20',
    pucExpiry: '2026-09-30',
    lastGpsUpdate: new Date().toISOString(),
    sensitive: {
      chassisNumber: 'MAT74803928174912',
      engineNumber: 'ENG-9982314-X',
      rcNumber: 'KA0120220098712',
      insurancePolicyNo: 'POL-TAX-998124'
    }
  },
  {
    id: 'veh-102',
    registration: 'MH-12-PQ-4821',
    makeModel: 'Mahindra Blazo X 28',
    type: 'Container Truck',
    status: 'idle',
    speed: 0,
    heading: 45,
    lat: 19.0760,
    lng: 72.8777,
    fuelLevel: 45,
    odometer: 89400,
    assignedDriverId: 'drv-202',
    assignedDriverName: 'Sunil Patil',
    purchaseDate: '2023-01-10',
    insuranceExpiry: '2026-07-15',
    pucExpiry: '2026-08-10',
    lastGpsUpdate: new Date().toISOString(),
    sensitive: {
      chassisNumber: 'MAM88901239102931',
      engineNumber: 'ENG-4432109-Y',
      rcNumber: 'MH1220230019234',
      insurancePolicyNo: 'POL-SEC-332190'
    }
  },
  {
    id: 'veh-103',
    registration: 'DL-01-AB-1234',
    makeModel: 'Eicher Pro 3019',
    type: 'Medium Duty Truck',
    status: 'moving',
    speed: 54,
    heading: 270,
    lat: 28.6139,
    lng: 77.2090,
    fuelLevel: 91,
    odometer: 64200,
    assignedDriverId: 'drv-203',
    assignedDriverName: 'Amit Singh',
    purchaseDate: '2023-06-20',
    insuranceExpiry: '2027-01-10',
    pucExpiry: '2026-12-05',
    lastGpsUpdate: new Date().toISOString(),
    sensitive: {
      chassisNumber: 'MAE12390847192834',
      engineNumber: 'ENG-1129384-Z',
      rcNumber: 'DL0120230045612',
      insurancePolicyNo: 'POL-ICICI-778213'
    }
  },
  {
    id: 'veh-104',
    registration: 'TN-09-CD-5678',
    makeModel: 'Ashok Leyland Captain',
    type: 'Trailer',
    status: 'sos',
    speed: 0,
    heading: 180,
    lat: 13.0827,
    lng: 80.2707,
    fuelLevel: 28,
    odometer: 198000,
    assignedDriverId: 'drv-204',
    assignedDriverName: 'Venkatesh R',
    purchaseDate: '2021-11-05',
    insuranceExpiry: '2026-05-18',
    pucExpiry: '2026-04-20',
    lastGpsUpdate: new Date().toISOString(),
    sensitive: {
      chassisNumber: 'MAL99812739182371',
      engineNumber: 'ENG-8827391-W',
      rcNumber: 'TN0920210087612',
      insurancePolicyNo: 'POL-BAJAJ-556123'
    }
  },
  {
    id: 'veh-105',
    registration: 'GJ-06-EF-9012',
    makeModel: 'Volvo FM 420',
    type: 'Heavy Hauler',
    status: 'offline',
    speed: 0,
    heading: 0,
    lat: 22.3072,
    lng: 73.1812,
    fuelLevel: 62,
    odometer: 112000,
    assignedDriverId: 'drv-205',
    assignedDriverName: 'Dharmesh Mehta',
    purchaseDate: '2022-09-12',
    insuranceExpiry: '2026-10-30',
    pucExpiry: '2026-10-01',
    lastGpsUpdate: new Date(Date.now() - 3600000 * 4).toISOString(),
    sensitive: {
      chassisNumber: 'VOV99812736192847',
      engineNumber: 'VOL-4491029-A',
      rcNumber: 'GJ0620220033412',
      insurancePolicyNo: 'POL-ROYAL-112948'
    }
  }
];

export const INITIAL_DRIVERS = [
  {
    id: 'drv-201',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@smartfleet.ai',
    phone: '+91 98765 43210',
    status: 'Active',
    assignedVehicleId: 'veh-101',
    assignedVehicleReg: 'KA-01-EQ-9042',
    licenseExpiry: '2028-04-14',
    experienceYears: 7,
    safetyScore: 92,
    totalTrips: 342,
    rating: 4.8,
    joinedDate: '2021-04-10',
    sensitive: {
      aadhaarNo: 'XXXX-XXXX-8921',
      panNo: 'ABCDE1234F',
      licenseNumber: 'KA-0120150098234',
      address: '742 10th Cross, Indiranagar, Bengaluru, KA',
      emergencyContact: '+91 98765 00001 (Wife)',
      bankAccountNumber: '91823910293120',
      bankIfsc: 'SBIN0001234'
    }
  },
  {
    id: 'drv-202',
    name: 'Sunil Patil',
    email: 'sunil.patil@smartfleet.ai',
    phone: '+91 98123 76543',
    status: 'Active',
    assignedVehicleId: 'veh-102',
    assignedVehicleReg: 'MH-12-PQ-4821',
    licenseExpiry: '2027-09-20',
    experienceYears: 5,
    safetyScore: 84,
    totalTrips: 215,
    rating: 4.5,
    joinedDate: '2022-01-15',
    sensitive: {
      aadhaarNo: 'XXXX-XXXX-4412',
      panNo: 'FGHIJ5678K',
      licenseNumber: 'MH-1220180011928',
      address: '45/2 Deccan Gymkhana, Pune, MH',
      emergencyContact: '+91 98123 00002 (Brother)',
      bankAccountNumber: '44128901239182',
      bankIfsc: 'HDFC0000123'
    }
  },
  {
    id: 'drv-203',
    name: 'Amit Singh',
    email: 'amit.singh@smartfleet.ai',
    phone: '+91 99887 11223',
    status: 'Active',
    assignedVehicleId: 'veh-103',
    assignedVehicleReg: 'DL-01-AB-1234',
    licenseExpiry: '2026-11-05',
    experienceYears: 9,
    safetyScore: 96,
    totalTrips: 512,
    rating: 4.9,
    joinedDate: '2020-08-01',
    sensitive: {
      aadhaarNo: 'XXXX-XXXX-9918',
      panNo: 'KLMNO9012P',
      licenseNumber: 'DL-0120130088192',
      address: 'B-12 Rohini Sector 7, New Delhi',
      emergencyContact: '+91 99887 00003 (Father)',
      bankAccountNumber: '99182301928301',
      bankIfsc: 'ICIC0000456'
    }
  },
  {
    id: 'drv-204',
    name: 'Venkatesh R',
    email: 'venkatesh.r@smartfleet.ai',
    phone: '+91 94433 22110',
    status: 'On Leave',
    assignedVehicleId: 'veh-104',
    assignedVehicleReg: 'TN-09-CD-5678',
    licenseExpiry: '2026-06-30',
    experienceYears: 6,
    safetyScore: 78,
    totalTrips: 189,
    rating: 4.2,
    joinedDate: '2022-05-18',
    sensitive: {
      aadhaarNo: 'XXXX-XXXX-3341',
      panNo: 'QRSTU3456V',
      licenseNumber: 'TN-0920160077123',
      address: '18 Anna Salai, Guindy, Chennai, TN',
      emergencyContact: '+91 94433 00004 (Wife)',
      bankAccountNumber: '33419082391029',
      bankIfsc: 'IOBA0000789'
    }
  }
];

export const INITIAL_TRIPS = [
  {
    id: 'trip-901',
    tripCode: 'TRP-2026-0891',
    vehicleId: 'veh-101',
    vehicleReg: 'KA-01-EQ-9042',
    driverId: 'drv-201',
    driverName: 'Rajesh Kumar',
    origin: 'Bengaluru ICD Nelamangala',
    destination: 'Chennai Port Container Terminal',
    startLocation: { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, KA' },
    endLocation: { lat: 13.0827, lng: 80.2707, address: 'Chennai Port, TN' },
    status: 'In Transit', // Scheduled, In Transit, Completed, Cancelled
    distanceKm: 348.5,
    durationHours: 6.5,
    idleMinutes: 24,
    startTime: '2026-08-27T08:30:00.000Z',
    endTime: null,
    avgSpeed: 58.4,
    fuelConsumedLitres: 92.5
  },
  {
    id: 'trip-902',
    tripCode: 'TRP-2026-0890',
    vehicleId: 'veh-102',
    vehicleReg: 'MH-12-PQ-4821',
    driverId: 'drv-202',
    driverName: 'Sunil Patil',
    origin: 'JNPT Port Navi Mumbai',
    destination: 'Chakan Industrial Zone Pune',
    startLocation: { lat: 18.9500, lng: 72.9500, address: 'JNPT Navi Mumbai' },
    endLocation: { lat: 18.7600, lng: 73.8500, address: 'Chakan Pune' },
    status: 'In Transit',
    distanceKm: 142.0,
    durationHours: 3.2,
    idleMinutes: 45,
    startTime: '2026-08-27T10:15:00.000Z',
    endTime: null,
    avgSpeed: 44.5,
    fuelConsumedLitres: 41.2
  },
  {
    id: 'trip-903',
    tripCode: 'TRP-2026-0889',
    vehicleId: 'veh-103',
    vehicleReg: 'DL-01-AB-1234',
    driverId: 'drv-203',
    driverName: 'Amit Singh',
    origin: 'Gurugram Warehousing Hub',
    destination: 'Jaipur Logistics Park',
    startLocation: { lat: 28.4595, lng: 77.0266, address: 'Gurugram, HR' },
    endLocation: { lat: 26.9124, lng: 75.7873, address: 'Jaipur, RJ' },
    status: 'Completed',
    distanceKm: 235.8,
    durationHours: 4.8,
    idleMinutes: 12,
    startTime: '2026-08-26T06:00:00.000Z',
    endTime: '2026-08-26T10:48:00.000Z',
    avgSpeed: 52.1,
    fuelConsumedLitres: 62.0
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'alt-501',
    category: 'SOS', // Fraud, Fuel, Maintenance, Geofence, SOS, Document Expiry, GPS Offline
    severity: 'Critical', // Critical, High, Medium, Low
    vehicleReg: 'TN-09-CD-5678',
    driverName: 'Venkatesh R',
    description: 'EMERGENCY SOS Triggered by Driver on NH-48 Highway.',
    timestamp: '2026-08-27T16:45:00.000Z',
    status: 'Open', // Open, Reviewed, Resolved
    location: { lat: 13.0827, lng: 80.2707 }
  },
  {
    id: 'alt-502',
    category: 'Fraud',
    severity: 'High',
    vehicleReg: 'MH-12-PQ-4821',
    driverName: 'Sunil Patil',
    description: 'Sudden fuel drop detected (35L drop in 5 mins while engine idle). Potential fuel siphoning alert.',
    timestamp: '2026-08-27T14:20:00.000Z',
    status: 'Open',
    location: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 'alt-503',
    category: 'Geofence',
    severity: 'Medium',
    vehicleReg: 'KA-01-EQ-9042',
    driverName: 'Rajesh Kumar',
    description: 'Entered Restricted Zone: Hosur Ring Road Freight Bypass.',
    timestamp: '2026-08-27T11:10:00.000Z',
    status: 'Reviewed',
    location: { lat: 12.9716, lng: 77.5946 }
  },
  {
    id: 'alt-504',
    category: 'Maintenance',
    severity: 'Medium',
    vehicleReg: 'GJ-06-EF-9012',
    driverName: 'Dharmesh Mehta',
    description: 'Brake fluid level low & Odometer threshold crossed 110,000 km service due.',
    timestamp: '2026-08-26T09:30:00.000Z',
    status: 'Open',
    location: { lat: 22.3072, lng: 73.1812 }
  }
];

export const DEMO_FUEL_METRICS = {
  totalSpentThisMonth: 485200,
  totalLitres: 5120,
  avgCostPerKm: 24.5,
  avgKmPerLitre: 3.85,
  monthlyTrend: [
    { month: 'Mar', cost: 410000, litres: 4400 },
    { month: 'Apr', cost: 435000, litres: 4600 },
    { month: 'May', cost: 420000, litres: 4500 },
    { month: 'Jun', cost: 460000, litres: 4900 },
    { month: 'Jul', cost: 475000, litres: 5050 },
    { month: 'Aug', cost: 485200, litres: 5120 }
  ],
  aiInsights: [
    {
      id: 'ins-1',
      title: 'High Engine Idle Detected',
      vehicle: 'MH-12-PQ-4821',
      description: 'Vehicle spent 45 mins idle during transit. Estimated 3.8L excess fuel wasted.',
      potentialSavings: '₹ 14,200 / month'
    },
    {
      id: 'ins-2',
      title: 'Fuel Mileage Below Fleet Average',
      vehicle: 'TN-09-CD-5678',
      description: 'Delivering 2.9 km/L vs fleet average 3.85 km/L. Tire pressure or fuel injector service recommended.',
      potentialSavings: '₹ 22,500 / month'
    }
  ]
};

export const DEMO_UTILISATION = [
  { vehicleReg: 'KA-01-EQ-9042', score: 88, activeHours: 14.5, idleRatio: 0.12, tripsPerDay: 2.8, recommendation: 'Optimal' },
  { vehicleReg: 'MH-12-PQ-4821', score: 72, activeHours: 9.2, idleRatio: 0.28, tripsPerDay: 1.5, recommendation: 'Monitor' },
  { vehicleReg: 'DL-01-AB-1234', score: 94, activeHours: 16.0, idleRatio: 0.08, tripsPerDay: 3.2, recommendation: 'Optimal' },
  { vehicleReg: 'TN-09-CD-5678', score: 45, activeHours: 4.8, idleRatio: 0.42, tripsPerDay: 0.8, recommendation: 'Reassign' },
  { vehicleReg: 'GJ-06-EF-9012', score: 28, activeHours: 2.1, idleRatio: 0.65, tripsPerDay: 0.3, recommendation: 'Consider Removal' }
];

export const DEMO_GEOFENCES = [
  { id: 'geo-1', name: 'Bengaluru Logistics Zone', type: 'Permitted', center: [12.9716, 77.5946], radius: 15000, color: '#10B981' },
  { id: 'geo-2', name: 'Hosur Restricted Depot', type: 'Restricted', center: [12.7409, 77.8253], radius: 8000, color: '#EF4444' },
  { id: 'geo-3', name: 'Mumbai JNPT Port Precinct', type: 'Permitted', center: [18.9500, 72.9500], radius: 12000, color: '#3B82F6' }
];

export const DEMO_SALARIES = [
  { id: 'sal-1', driverId: 'drv-201', driverName: 'Rajesh Kumar', month: 'August 2026', amount: 35000, due: '2026-08-31', status: 'Credited', txnId: 'TXN9982310293' },
  { id: 'sal-2', driverId: 'drv-202', driverName: 'Sunil Patil', month: 'August 2026', amount: 32000, due: '2026-08-31', status: 'Pending', txnId: '-' },
  { id: 'sal-3', driverId: 'drv-203', driverName: 'Amit Singh', month: 'August 2026', amount: 38000, due: '2026-08-31', status: 'Credited', txnId: 'TXN8871293012' },
  { id: 'sal-4', driverId: 'drv-204', driverName: 'Venkatesh R', month: 'August 2026', amount: 30000, due: '2026-08-31', status: 'Failed', txnId: 'TXN4451293019' }
];

export const DEMO_AUDIT_LOGS = [
  { id: 'aud-101', user: 'super.admin@smartfleet.ai', role: 'Super Admin', action: 'Secondary Authentication Granted', target: 'Driver drv-201 (Rajesh Kumar)', timestamp: '2026-08-27T16:10:22.000Z', ip: '157.48.21.90' },
  { id: 'aud-102', user: 'manager@smartfleet.ai', role: 'Sub-Admin', action: 'Vehicle Status Changed', target: 'Vehicle veh-104 -> SOS', timestamp: '2026-08-27T15:45:10.000Z', ip: '115.240.88.14' },
  { id: 'aud-103', user: 'hr@smartfleet.ai', role: 'Accountant/HR', action: 'Salary Status Updated', target: 'Driver drv-201 -> Credited', timestamp: '2026-08-27T14:30:00.000Z', ip: '182.72.10.45' }
];
