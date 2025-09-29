

export const mockGates = [
    { id: 1, name: "Entry Gate", ip: "10.0.0.185", port: "5000", output: "1" },
    { id: 2, name: "Exit Gate", ip: "192.168.1.11", port: "5000", output: "2" },
    { id: 3, name: "Garage P2 Exit", ip: "192.168.1.12", port: "5000", output: "3" },
];

export const mockCashiers: { id: number; name: string; assignedGateId: number | null; role: 'admin' | 'cashier' | 'viewer' | 'operator'; email: string; }[] = [
    { id: 1, name: "John Doe", assignedGateId: 2, role: 'cashier' as const, email: 'john.doe@example.com' },
    { id: 2, name: "Jane Smith", assignedGateId: 3, role: 'cashier' as const, email: 'jane.smith@example.com' },
    { id: 3, name: "Admin User", assignedGateId: null, role: 'admin' as const, email: 'admin@parkpay.co' },
    { id: 4, name: "Viewer User", assignedGateId: null, role: 'viewer' as const, email: 'viewer@example.com' },
    { id: 5, name: "Operator User", assignedGateId: 1, role: 'operator' as const, email: 'operator@example.com' },
];


export const mockParkers: { id: number; name: string; plate: string; participation: 'daily' | 'weekly' | 'monthly' | 'yearly'; type: 'tenant' | 'owner' | 'vip' | 'staff' | 'visitor'; accessId: string; tel: string; email: string; dob: string; carModel: string; }[] = [
  { id: 1, name: 'Alice Johnson', plate: 'VIP-001', participation: 'monthly', type: 'vip', accessId: 'CARD-1001', tel: '555-1234', email: 'alice@example.com', dob: '1990-05-15', carModel: 'Tesla Model 3' },
  { id: 2, name: 'Bob Williams', plate: 'EMP-002', participation: 'yearly', type: 'staff', accessId: 'CARD-1002', tel: '555-5678', email: 'bob@example.com', dob: '1985-11-20', carModel: 'Ford F-150' },
  { id: 3, name: 'Charlie Brown', plate: 'WK-003', participation: 'weekly', type: 'tenant', accessId: 'QR-CODE-XYZ', tel: '555-9876', email: 'charlie@example.com', dob: '1998-02-10', carModel: 'Honda Civic' },
  { id: 4, name: 'Diana Prince', plate: 'OWN-1', participation: 'yearly', type: 'owner', accessId: 'CARD-1004', tel: '555-4321', email: 'diana@example.com', dob: '1980-01-01', carModel: 'Audi Q5' },
];


export const initialMockTickets = [
    { id: "T84B2-3", entryTime: new Date(new Date().getTime() - 3 * 60 * 60 * 1000 - 15 * 60 * 1000), plate: "CD-1123", status: "In-Park", type: 'visitor' },
    { id: "T84B2-5", entryTime: new Date(new Date().getTime() - 1 * 60 * 60 * 1000 - 45 * 60 * 1000), plate: "EF-6789", status: "In-Park", type: 'visitor' },
];

export const initialMockTransactions = [
    { ticketId: "T84B2-1", plate: "AD-4589", exit: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Paid", amount: 13.00 },
    { ticketId: "T84B2-2", plate: "BC-9102", exit: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Paid", amount: 9.00 },
    { ticketId: "T84B2-4", plate: "DE-4455", exit: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Paid", amount: 5.00 },
];

    