import * as express from 'express';
import { Router, Response } from 'express';

const app = express();
const route = Router();

app.use(express.json());

route.get('/', (res: Response) => {
    res.json({ message: "Server Running" });
});

app.use(route);

app.listen(3000, () => {
    console.log('--- Running on port 3000 ---');
});
