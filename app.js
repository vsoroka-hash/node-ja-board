import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { errors } from 'celebrate';
import announcementsRouter from './src/routes/announcements.routes.js';

const app = express();
const PORT = 3000;

app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Announcements API',
      version: '1.0.0',
      description: 'REST API for bulletin board'
    }
  },
  apis: ['./src/routes/*.js']
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/announcements', announcementsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errors());

app.use((err, req, res, next) => {
  if (err?.code === 'P2025') {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
