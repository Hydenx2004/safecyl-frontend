# SafeCyl Frontend (Vite + React)

This is a minimal React frontend scaffold (Vite) that calls the backend endpoints `/api/ping` and `/api/all`.

## Quick start (PowerShell)

From the repository root or the `frontend` folder:

```powershell
cd c:\Users\HYDEN\OneDrive\Desktop\Iotproject\frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser (Vite default). The app assumes the backend is accessible at the same origin (`/api/*`) or you can configure a proxy in `vite.config.js` if your backend runs on a different port.

## Notes
- This scaffold uses Vite. If you prefer CRA or another setup let me know and I can switch it.
- To proxy API requests to `http://localhost:3000`, you can add a `vite.config.js` with a dev server proxy. I can add that for you if helpful.
