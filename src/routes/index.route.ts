import express from 'express';
import { UserRouter } from '../app/router/user.route';
import { AuthRouter } from '../app/router/auth.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRouter,
  },
  {
    path: '/auth',
    route: AuthRouter,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
