import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { memberService } from '../services/memberService';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// All routes require member authentication
router.use(authenticate);
router.use(authorize('member'));

// Get dashboard
router.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const dashboard = await memberService.getDashboard(member.memberId);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

// Update profile
const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

router.put('/profile', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const updated = await memberService.updateProfile(member.memberId, validatedData);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Health metrics
const healthMetricSchema = z.object({
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  muscleMass: z.number().positive().optional(),
  restingHeartRate: z.number().int().min(30).max(200).optional(),
  bloodPressureSystolic: z.number().int().positive().optional(),
  bloodPressureDiastolic: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

router.post('/health-metrics', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const validatedData = healthMetricSchema.parse(req.body);
    const metric = await memberService.addHealthMetric(member.memberId, validatedData);
    res.status(201).json(metric);
  } catch (error) {
    next(error);
  }
});

router.get('/health-metrics', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const metrics = await memberService.getHealthMetrics(member.memberId, limit);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Fitness goals
const goalSchema = z.object({
  goalType: z.enum(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness']),
  targetValue: z.number().positive(),
  targetDate: z.string().transform((str) => new Date(str)),
  currentValue: z.number().optional(),
  notes: z.string().optional(),
});

router.post('/goals', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const validatedData = goalSchema.parse(req.body);
    const goal = await memberService.createGoal(member.memberId, validatedData);
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
});

router.get('/goals', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const status = req.query.status as any;
    const goals = await memberService.getGoals(member.memberId, status);
    res.json(goals);
  } catch (error) {
    next(error);
  }
});

router.put('/goals/:goalId', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const goalId = parseInt(req.params.goalId);
    const updateSchema = z.object({
      targetValue: z.number().positive().optional(),
      currentValue: z.number().optional(),
      targetDate: z.string().transform((str) => new Date(str)).optional(),
      status: z.enum(['active', 'achieved', 'paused', 'cancelled']).optional(),
      notes: z.string().optional(),
    });

    const validatedData = updateSchema.parse(req.body);
    const goal = await memberService.updateGoal(goalId, member.memberId, validatedData);
    res.json(goal);
  } catch (error) {
    next(error);
  }
});

// Personal training sessions
const ptSessionSchema = z.object({
  trainerId: z.number().int().positive(),
  roomId: z.number().int().positive().optional(),
  scheduledDate: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

router.post('/pt-sessions', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const validatedData = ptSessionSchema.parse(req.body);
    const session = await memberService.bookPTSession(member.memberId, validatedData);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.get('/pt-sessions/upcoming', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const sessions = await memberService.getUpcomingSessions(member.memberId);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Class registrations
router.post('/classes/:scheduleId/register', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const scheduleId = parseInt(req.params.scheduleId);
    const registration = await memberService.registerForClass(member.memberId, scheduleId);
    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
});

router.get('/classes/registrations', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const registrations = await memberService.getClassRegistrations(member.memberId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
});

export default router;

