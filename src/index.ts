import express from 'express';
import cors from 'cors';
import { config } from './config/env'
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});