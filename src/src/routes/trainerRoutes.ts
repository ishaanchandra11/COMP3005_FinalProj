import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { trainerService } from '../services/trainerService';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// All routes require trainer authentication
router.use(authenticate);
router.use(authorize('trainer'));

// Get trainer profile
router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { user_id: req.userId! },
      include: {
        users: true,
      },
    });

    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    res.json(trainer);
  } catch (error) {
    next(error);
  }
});

// Set availability
const availabilitySchema = z.object({
  dayOfWeek: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isRecurring: z.boolean().optional(),
  effectiveDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
});

router.post('/availability', async (req: AuthRequest, res, next) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { user_id: req.userId! },
    });

    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const validatedData = availabilitySchema.parse(req.body);
    const availability = await trainerService.setAvailability(trainer.trainerId, validatedData);
    res.status(201).json(availability);
  } catch (error) {
    next(error);
  }
});

// Get availability
router.get('/availability', async (req: AuthRequest, res, next) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { user_id: req.userId! },
    });

    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const availability = await trainerService.getAvailability(trainer.trainerId);
    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Delete availability
router.delete('/availability/:id', async (req: AuthRequest, res, next) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { user_id: req.userId! },
    });

    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const availabilityId = parseInt(req.params.id);
    await trainerService.deleteAvailability(availabilityId, trainer.trainerId);
    res.json({ message: 'Availability slot deleted' });
  } catch (error) {
    next(error);
  }
});

// Get schedule (PT sessions + classes)
router.get('/schedule', async (req: AuthRequest, res, next) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { user_id: req.userId! },
    });

    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const schedule = await trainerService.getSchedule(trainer.trainerId, startDate, endDate);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

// Search members (read-only)
router.get('/members/search', async (req: AuthRequest, res, next) => {
  try {
    const searchTerm = req.query.q as string;

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters' });
    }

    const members = await trainerService.searchMembers(searchTerm);
    res.json(members);
  } catch (error) {
    next(error);
  }
});

// Get member details (read-only)
router.get('/members/:memberId', async (req: AuthRequest, res, next) => {
  try {
    const memberId = parseInt(req.params.memberId);

    const member = await prisma.member.findUnique({
      where: { memberId },
      select: {
        memberId: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        membershipStatus: true,
        joinDate: true,
      },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Get latest health metric
    const latestMetric = await prisma.healthMetric.findFirst({
      where: { memberId },
      orderBy: { recordedAt: 'desc' },
    });

    // Get active goals
    const activeGoals = await prisma.fitnessGoal.findMany({
      where: {
        memberId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get recent class attendance
    const recentClasses = await prisma.classRegistration.findMany({
      where: {
        memberId,
        attendanceStatus: 'attended',
      },
      include: {
        schedule: {
          include: {
            groupClass: true,
          },
        },
      },
      orderBy: {
        schedule: {
          scheduledDate: 'desc',
        },
      },
      take: 5,
    });

    res.json({
      ...member,
      latestMetric,
      activeGoals,
      recentClasses: recentClasses.map(rc => ({
        className: rc.schedule.groupClass.className,
        date: rc.schedule.scheduledDate,
        attendanceStatus: rc.attendanceStatus,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

