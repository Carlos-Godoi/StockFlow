import { Router } from 'express';
import { registerUser, loginUser, register } from '../controllers/auth.controller';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/register', register);


export default router;