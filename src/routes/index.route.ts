import express from 'express';
import { UserRouter } from '../app/router/user.route';
import { AuthRouter } from '../app/router/auth.route';
import { ProviderRoter } from '../app/router/provider.route';
import { AdminRoter } from '../app/router/admin.route';
import { PaymentRoute } from '../app/router/payment.route';
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
  {
    path: '/provider',
    route: ProviderRoter
  },
  {
    path: '/admin',
    route: AdminRoter
  },
  {
    path: '/payment',
    route: PaymentRoute
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
