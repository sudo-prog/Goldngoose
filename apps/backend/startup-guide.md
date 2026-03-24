# RAG_GOD Startup Guide

## Quick Start

### 1. Start the Backend
```bash
cd RAG_GOD
python src/main.py
```
Backend will start on `http://localhost:8000`

### 2. Start the Frontend
```bash
cd RAG_GOD/rag-god-terminal
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`

## Troubleshooting

### Common Issues

**1. WebSocket Connection Failed**
- Ensure backend is running on port 8000
- Check firewall settings
- Verify CORS configuration in backend

**2. Chart Not Loading**
- Ensure lightweight-charts is properly installed
- Check browser console for JavaScript errors
- Verify chart container has proper dimensions

**3. API Connection Issues**
- Check if backend is running
- Verify API endpoints are accessible
- Check network tab in browser dev tools

### Environment Setup

**Backend Environment Variables (.env)**
```
POLYMARKET_API_KEY=your_key
WALLET_PRIVATE_KEY=0x...
RPC_URL=https://...
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

**Frontend Environment Variables (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Testing the Connection

1. **Test Backend**: Visit `http://localhost:8000/status`
2. **Test WebSocket**: Visit `http://localhost:8000/ws` (should upgrade to WebSocket)
3. **Test Frontend**: Visit `http://localhost:3000`

### Docker Setup

```bash
cd RAG_GOD
docker-compose up -d
```

This will start both backend and Neo4j database.

## Development Tips

- Backend auto-restarts on code changes
- Frontend hot-reloads on changes
- Use browser dev tools to monitor WebSocket connections
- Check console logs for both backend and frontend errors