import { Router } from 'express';
import { getMe } from './auth.controller';
import { verifyToken } from '../../common/middleware/auth';

const router = Router();

router.get('/me', verifyToken, getMe);

export default router;
