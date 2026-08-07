import { Router } from 'express';
import { getMyNotifications, markNotificationRead, markAllRead } from './notification.controller';
import { verifyToken } from '../../common/middleware/auth';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.get('/', verifyToken, asyncHandler(getMyNotifications));
router.post('/read-all', verifyToken, asyncHandler(markAllRead));
router.patch('/:notificationId/read', verifyToken, asyncHandler(markNotificationRead));

export default router;
