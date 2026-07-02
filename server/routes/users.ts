import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

const adminRoles = requireRole('super_admin', 'tenant_admin');

router.get('/', requireAuth, usersController.list);
router.post('/', requireAuth, adminRoles, usersController.create);
router.patch('/:id', requireAuth, adminRoles, usersController.update);
router.put('/:id', requireAuth, adminRoles, usersController.update);
router.delete('/:id', requireAuth, adminRoles, usersController.remove);

export default router;
