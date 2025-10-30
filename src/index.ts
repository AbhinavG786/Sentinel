import express from 'express';
import cors from 'cors';
import { config } from './config/env'
import router from './routes/index';
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

app.use('/api', router);


app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});