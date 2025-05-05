import express from 'express';
import { UserRouter } from '../app/router/user.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRouter,
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
