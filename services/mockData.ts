
// Comprehensive mock data for all modules

export const MOCK_CUSTOMERS = [
    { id: '1', customerId: 'CUST-001', name: 'Alok Nath', propertyType: 'Residential', ward: '35-Bankhandi', zone: 'Zone A', phone: '9876543210', email: 'alok@example.com', kycStatus: 'Completed' },
    { id: '2', customerId: 'CUST-002', name: 'Sunita Sharma', propertyType: 'Residential', ward: '35-Bankhandi', zone: 'Zone A', phone: '9876543211', email: 'sunita@example.com', kycStatus: 'Pending' },
    { id: '3', customerId: 'CUST-003', name: 'Hotel Grand', propertyType: 'Commercial', ward: '65-Holi Gali', zone: 'Zone B', phone: '9876543212', email: 'grand@hotel.com', kycStatus: 'Completed' },
    { id: '4', customerId: 'CUST-004', name: 'Everest Industries', propertyType: 'Industrial', ward: '56-Mandi Ramdas', zone: 'Zone C', phone: '9876543213', email: 'info@everest.com', kycStatus: 'Completed' },
    { id: '5', customerId: 'CUST-005', name: 'Unity School', propertyType: 'Institutional', ward: '30-Krishna Nagar', zone: 'Zone A', phone: '9876543214', email: 'unity@school.edu', kycStatus: 'Pending' },
    { id: '6', customerId: 'CUST-006', name: 'Rajesh Varma', propertyType: 'Residential', ward: '65-Holi Gali', zone: 'Zone B', phone: '9876543215', email: 'rajesh@example.com', kycStatus: 'Completed' },
    { id: '7', customerId: 'CUST-007', name: 'Metro Hospital', propertyType: 'Institutional', ward: '35-Bankhandi', zone: 'Zone B', phone: '9876543216', email: 'metro@hospital.org', kycStatus: 'Completed' },
];

export const MOCK_USER_CHARGES = [
    { id: '1', customerId: 'CUST-001', amount: 500, date: '2026-03-07', receiptNumber: 'REC-1001', paymentMode: 'Cash' },
    { id: '2', customerId: 'CUST-003', amount: 2500, date: '2026-03-07', receiptNumber: 'REC-1002', paymentMode: 'Online' },
    { id: '3', customerId: 'CUST-006', amount: 450, date: '2026-03-06', receiptNumber: 'REC-1003', paymentMode: 'UPI' },
    { id: '4', customerId: 'CUST-004', amount: 5000, date: '2026-02-28', receiptNumber: 'REC-0950', paymentMode: 'Cheque' },
];

export const MOCK_FUEL_ENTRIES = [
    { id: '1', vehicleId: 'UP85AG0770', date: '2026-03-07', quantity: 25, amount: 2450, station: 'Bharat Petroleum', slipNo: 'S-7721' },
    { id: '2', vehicleId: 'UP85ET 7839', date: '2026-03-07', quantity: 30, amount: 2940, station: 'Indian Oil', slipNo: 'S-7722' },
    { id: '3', vehicleId: 'UP14PT7717', date: '2026-03-06', quantity: 20, amount: 1960, station: 'Reliance Petroleum', slipNo: 'S-7715' },
];

export const MOCK_WEIGHMENTS = [
    { id: '1', vehicleId: 'UP85AG0770', date: '2026-03-07', time: '10:30 AM', grossWeight: 5500, tareWeight: 3500, netWeight: 2000, type: 'Waste' },
    { id: '2', vehicleId: 'UP85ET 7839', date: '2026-03-07', time: '11:45 AM', grossWeight: 6200, tareWeight: 3600, netWeight: 2600, type: 'Waste' },
    { id: '3', vehicleId: 'UP14PT7717', date: '2026-03-06', time: '09:15 AM', grossWeight: 5800, tareWeight: 3550, netWeight: 2250, type: 'Mixed' },
];

export const MOCK_BULK_COLLECTIONS = [
    { id: '1001', qr: 'QR-A1', date: '2026-03-07', site: 'Grand Hotel', supervisor: 'Ramesh Balan', sid: 'S001', btime: '07:30 AM', bimg: 'Img1', atime: '08:15 AM', aimg: 'Img2', ward: '35-Bankhandi', fill: '85%', feedback: 'Good' },
    { id: '1002', qr: 'QR-B2', date: '2026-03-07', site: 'City Hospital', supervisor: 'Suresh Kumar', sid: 'S002', btime: '08:00 AM', bimg: 'Img3', atime: '08:45 AM', aimg: 'Img4', ward: '65-Holi Gali', fill: '40%', feedback: 'On-time' },
];

export const MOCK_ATTENDANCE = [
    { id: '1', name: 'Rajesh Kumar', empId: 'EMP001', present: 22, absent: 2, missed: 1, statusPattern: 'PPPPAPPPPPMP', img: '' },
    { id: '2', name: 'Suresh Singh', empId: 'EMP002', present: 20, absent: 4, missed: 0, statusPattern: 'PPPPAAPPPPAA', img: '' },
];

export const MOCK_COMPLAINTS = [
    { id: '1', sno: 1, customerId: 'CUST-8821', name: 'Rahul Varma', number: '+91 98765 43210', date: '2026-03-05', status: 'Resolved', ward: '35-Bankhandi', type: 'Public Health', complaintId: 'CMP-0041', rDate: '2026-03-06', feedback: 'Satisfied' },
    { id: '2', sno: 2, customerId: 'CUST-4122', name: 'Anita Desai', number: '+91 87654 32109', date: '2026-03-06', status: 'Pending', ward: '30-Krishna Nagar', type: 'Street Light', complaintId: 'CMP-0042', rDate: '-', feedback: '-' },
];

export const MOCK_ZONES = [
    { id: 'z1', name: 'Zone A', circles: ['Circle 1', 'Circle 2'] },
    { id: 'z2', name: 'Zone B', circles: ['Circle 3', 'Circle 4'] },
    { id: 'z3', name: 'Zone C', circles: ['Circle 5'] },
];

export const MOCK_WARDS = [
    { id: 'w1', name: '35-Bankhandi', zone: 'Zone A' },
    { id: 'w2', name: '65-Holi Gali', zone: 'Zone B' },
    { id: 'w3', name: '56-Mandi Ramdas', zone: 'Zone A' },
    { id: 'w4', name: '30-Krishna Nagar', zone: 'Zone B' },
    { id: 'w5', name: 'Ward 05', zone: 'Zone C' },
];
