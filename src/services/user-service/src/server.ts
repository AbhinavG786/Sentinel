import express from 'express';
import userRoutes from './routes/users.route';
const app = express();

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/users', userRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});

