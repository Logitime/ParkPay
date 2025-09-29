
# ParkPay Application Architecture

## 1. Overview

ParkPay is a comprehensive parking management system built as a modern web application. It provides a suite of tools for administrators, cashiers, and gate operators to manage a parking facility. The system includes a real-time dashboard, cashier and operator interfaces, long-term parker management, reporting, and hardware integration for gate control. It also leverages AI for predictive analysis and automated communications.

## 2. Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Charts**: [Recharts](https://recharts.org/)

## 3. Project Structure

The project follows a standard Next.js App Router structure.

```
.
├── src
│   ├── app/                # Main application routes (pages)
│   │   ├── (dashboard)/    # Main authenticated routes
│   │   │   ├── page.tsx    # Dashboard page
│   │   │   ├── cashier/
│   │   │   ├── operator/
│   │   │   ├── reports/
│   │   │   └── ...
│   │   ├── kiosk/          # Standalone kiosk display page
│   │   ├── globals.css     # Global styles and Tailwind directives
│   │   └── layout.tsx      # Root layout for the entire application
│   │
│   ├── ai/                 # Genkit AI integration
│   │   ├── flows/          # AI flows (e.g., occupancy prediction)
│   │   └── genkit.ts       # Genkit initialization and configuration
│   │
│   ├── components/         # Reusable React components
│   │   ├── dashboard/      # Components specific to the dashboard
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   ├── reports/        # Components for the reports page
│   │   └── ui/             # Core UI components from ShadCN
│   │
│   ├── hooks/              # Custom React hooks (e.g., use-toast)
│   │
│   └── lib/                # Library files, utilities, and mock data
│       ├── mock-data.ts    # Mock data for parkers, gates, etc.
│       └── utils.ts        # Utility functions (e.g., cn for classnames)
│
├── public/                 # Static assets
└── package.json            # Project dependencies and scripts
```

## 4. Core Features & Implementation

### 4.1. Routing and Layout

- The application uses the **Next.js App Router**. All pages are located within the `src/app` directory.
- A persistent sidebar and header are defined in the root `layout.tsx`.
- The `SidebarLinks.tsx` component centrally manages navigation links.

### 4.2. State Management

- **Client-side State**: Managed primarily using React's built-in hooks (`useState`, `useEffect`). This is suitable for component-level state like form inputs, dialog visibility, and UI-specific data.
- **Server-side Mutations**: Handled via **Next.js Server Actions** located in `src/app/actions.ts`. These functions run exclusively on the server and are used for tasks like:
    - Calling AI flows (`getOccupancyPrediction`).
    - Sending hardware commands (`controlGate`, `readGateSensor`).
    - Simulating database updates.

### 4.3. UI and Styling

- The UI is built with **ShadCN/UI components**, which are unstyled, accessible components that can be customized.
- Styling is done using **Tailwind CSS**. The theme (colors, radius, etc.) is configured in `tailwind.config.ts` and `src/app/globals.css`.
- Charts for reporting are created using **Recharts**.

### 4.4. AI Integration (Genkit)

- AI functionality is powered by **Genkit**.
- **Flows** are defined in `src/ai/flows/`. A flow is a server-side function that orchestrates calls to a Large Language Model (LLM).
- **Schema Definition**: Zod is used to define the input and output schemas for each flow, ensuring type safety and structured data.
- **Example Flows**:
    - `occupancy-prediction.ts`: Takes a text description of conditions and returns a structured JSON object with a prediction.
    - `generate-parker-email.ts`: Generates a professional email body and subject based on parker details.

### 4.5. Hardware Integration (Gate Control)

- Gate control logic is encapsulated within Server Actions in `src/app/actions.ts`.
- The `controlGate` and `readGateSensor` functions use Node.js's built-in `net` module to create a TCP socket connection to a hardware relay board (simulated at a specific IP address and port).
- Commands are sent as simple strings (e.g., `on1`, `off1`, `input`), and responses are parsed to determine the status of gates and sensors.
- This approach keeps hardware communication securely on the server, preventing direct access from the client.
