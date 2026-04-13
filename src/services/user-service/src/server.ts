import express from 'express';
import userRoutes from './routes/users.route';
import projectsRoutes from './routes/projects.routes';

const app = express();
app.use(express.json()); 

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/users', userRoutes);
app.use('/projects', projectsRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});

