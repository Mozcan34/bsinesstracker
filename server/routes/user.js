import { Router } from 'express';
import { UserService } from '../services/userService';
import { userFormSchema } from '@shared/schema';
import { z } from 'zod';
const router = Router();
const userService = new UserService();
// Yeni kullanıcı oluştur
router.post('/api/users', async (req, res) => {
    try {
        const validatedData = userFormSchema.parse(req.body);
        // Kullanıcı adı ve e-posta kontrolü
        const existingUsername = await userService.findByUsername(validatedData.username);
        if (existingUsername) {
            return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
        }
        const existingEmail = await userService.findByEmail(validatedData.email);
        if (existingEmail) {
            return res.status(400).json({ message: "Bu e-posta adresi zaten kullanılıyor" });
        }
        const user = await userService.createUser(validatedData);
        res.status(201).json(user);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Geçersiz veri",
                errors: error.errors
            });
        }
        console.error('Kullanıcı oluşturma hatası:', error);
        res.status(500).json({ message: "Kullanıcı oluşturulurken bir hata oluştu" });
    }
});
// Kullanıcı girişi
router.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Kullanıcı adı ve şifre gereklidir" });
        }
        const user = await userService.validateUser(username, password);
        if (!user) {
            return res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
        }
        // Başarılı giriş
        res.json(user);
    }
    catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ message: "Giriş yapılırken bir hata oluştu" });
    }
});
router.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    // Burada normalde veritabanından kullanıcı bilgileri çekilir
    res.json({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date()
    });
});
export default router;
