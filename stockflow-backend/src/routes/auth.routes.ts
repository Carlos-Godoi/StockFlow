import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);


export default router;