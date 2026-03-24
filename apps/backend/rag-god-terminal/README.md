# RAG_GOD Terminal

AI-Powered Prediction Market Trading Terminal built with Next.js 16, React 19, and FastAPI.

## Features

- **Real-time Dashboard**: Live system status and PnL tracking
- **Mode Switching**: Switch between RAG_GOD modes (0-3) with one click
- **WebSocket Integration**: Real-time updates via WebSocket connection
- **Paper Mirror PnL**: Track paper trading performance
- **Order Execution**: Send orders through RAG_GOD backend
- **Whale Alerts**: Real-time whale activity monitoring
- **Professional UI**: Built with shadcn/ui and Tailwind CSS

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- @tanstack/react-query for data fetching
- lightweight-charts for PnL visualization
- Zustand for state management

### Backend Integration
- FastAPI backend (port 8000)
- WebSocket real-time communication
- REST API endpoints

## Installation

1. Navigate to the terminal directory:
```bash
cd RAG_GOD/rag-god-terminal
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Setup

The terminal connects to the RAG_GOD FastAPI backend running on port 8000. Make sure to:

1. Start the RAG_GOD backend:
```bash
cd RAG_GOD
python src/main.py
```

2. Ensure the backend is running on `http://localhost:8000`

## Architecture

### Components
- **Dashboard**: Main trading interface with mode switching
- **WebSocket Hook**: Real-time data streaming
- **Order Store**: Zustand-based order management
- **Chart Components**: Lightweight charts for PnL visualization
- **UI Components**: shadcn/ui based components

### Data Flow
1. Frontend connects to backend via WebSocket
2. Real-time updates stream to frontend every 2 seconds
3. Mode switching sends REST requests to backend
4. Order execution goes through RAG_GOD workflow
5. Paper mirror PnL updates in real-time

## API Endpoints

The terminal communicates with these backend endpoints:

- `GET /status` - Get current system status
- `POST /switch-mode` - Switch between modes
- `POST /execute` - Execute trades
- `GET /health` - Health check
- `WS /ws` - WebSocket for real-time updates

## Customization

### Theme
The application uses CSS variables for theming. Modify the `:root` variables in `app/globals.css` to customize colors.

### Charts
Charts are built with lightweight-charts. Customize the `PnLChart` component in `components/Chart.tsx` for different visualizations.

### Components
All UI components are built with shadcn/ui. Add new components by running:
```bash
npx shadcn-ui@latest add [component-name]
```

## Development

### Environment Variables
Create a `.env.local` file for frontend-specific environment variables:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Build
```bash
npm run build
npm start
```

## Docker

The backend includes Docker support. See the main RAG_GOD README for Docker setup instructions.