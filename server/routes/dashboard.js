import { Router } from 'express';
import { storage } from '../storage';
const router = Router();
router.get('/stats', async (req, res) => {
    try {
        const { period = 'thisMonth' } = req.query;
        const stats = await storage.getDashboardStats(period);
        res.json(stats);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});
router.get('/recent-activities', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const activities = await storage.getRecentActivities(limit);
        res.json(activities);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});
router.get('/upcoming-tasks', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const tasks = await storage.getUpcomingTasks(limit);
        res.json(tasks);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});
export default router;
