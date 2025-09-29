export const mockGates = [
    { id: 1, name: "Entry Gate", ip: "10.0.0.185", port: "5000", output: "1" },
    { id: 2, name: "Exit Gate", ip: "192.168.1.11", port: "5000", output: "2" },
    { id: 3, name: "Garage P2 Exit", ip: "192.168.1.12", port: "5000", output: "3" },
];

export const mockCashiers = [
    { id: 1, name: "John Doe", assignedGateId: 2, role: 'cashier' as const, email: 'john.doe@example.com' },
    { id: 2, name: "Jane Smith", assignedGateId: 3, role: 'cashier' as const, email: 'jane.smith@example.com' },
    { id: 3, name: "Admin User", assignedGateId: null, role: 'admin' as const, email: 'admin@parkpay.co' },
    { id: 4, name: "Viewer User", assignedGateId: null, role: 'viewer' as const, email: 'viewer@example.com' },
];

export const initialMockTickets = [
    { id: "T84B2-3", entryTime: new Date(new Date().getTime() - 3 * 60 * 60 * 1000 - 15 * 60 * 1000), plate: "CD-1123", status: "In-Park" },
    { id: "T84B2-5", entryTime: new Date(new Date().getTime() - 1 * 60 * 60 * 1000 - 45 * 60 * 1000), plate: "EF-6789", status: "In-Park" },
    { id: "V-EL5-9", entryTime: new Date(new Date().getTime() - 10 * 60 * 60 * 1000 - 30 * 60 * 1000), plate: "XY-9876", status: "In-Park", type: 'vip' },
];

export const initialMockTransactions = [
    { ticketId: "T84B2-1", plate: "AD-4589", exit: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Paid", amount: 13.00 },
    { ticketId: "T84B2-2", plate: "BC-9102", exit: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Paid", amount: 9.00 },
    { ticketId: "T84B2-4", plate: "DE-4455", exit: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Paid", amount: 5.00 },
];
