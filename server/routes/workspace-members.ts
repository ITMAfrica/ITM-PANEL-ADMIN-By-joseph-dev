import { Router } from 'express';
import * as membersController from '../controllers/workspace-members.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantRole } from '../middleware/rbac';

const router = Router({ mergeParams: true });

const canManage = requireTenantRole('tenant_admin');

router.get('/', requireAuth, membersController.listMembers);
router.post('/', requireAuth, canManage, membersController.addMember);
router.patch('/:userId', requireAuth, canManage, membersController.updateMember);
router.delete('/:userId', requireAuth, canManage, membersController.removeMember);

export default router;
