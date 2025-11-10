import express, { Request, Response } from 'express';
import cors from 'cors';
import { apiSpecRouter } from './routes/apiSpec';
import { chatRouter } from './routes/chat';
import { componentRouter } from './routes/component';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/spec', apiSpecRouter);
app.use('/api/chat', chatRouter);
app.use('/api/component', componentRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mile server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
});

export default app;
