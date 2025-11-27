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
  weight: z.coerce.number().positive().optional(),
  height: z.coerce.number().positive().optional(),
  bodyFatPercentage: z.coerce.number().min(0).max(100).optional(),
  muscleMass: z.coerce.number().positive().optional(),
  restingHeartRate: z.coerce.number().int().min(30).max(200).optional(),
  bloodPressureSystolic: z.coerce.number().int().positive().optional(),
  bloodPressureDiastolic: z.coerce.number().int().positive().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // If both blood pressure values are provided, systolic must be greater than diastolic
    if (data.bloodPressureSystolic && data.bloodPressureDiastolic) {
      return data.bloodPressureSystolic > data.bloodPressureDiastolic;
    }
    return true;
  },
  {
    message: "Systolic blood pressure must be greater than diastolic blood pressure",
    path: ["bloodPressureSystolic"],
  }
);

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
  targetValue: z.coerce.number().positive(),
  targetDate: z.string().transform((str) => new Date(str)),
  currentValue: z.coerce.number().optional(),
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
      targetValue: z.coerce.number().positive().optional(),
      currentValue: z.coerce.number().optional(),
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
  trainerId: z.coerce.number().int().positive(),
  roomId: z.coerce.number().int().positive().optional(),
  scheduledDate: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
}).refine(
  (data) => {
    // Trim whitespace from time strings
    const startTime = data.startTime.trim();
    const endTime = data.endTime.trim();
    
    // Parse times (HTML time inputs send HH:MM format in 24-hour, e.g., "17:30" for 5:30 PM)
    const startMatch = startTime.match(/^(\d{2}):(\d{2})$/);
    const endMatch = endTime.match(/^(\d{2}):(\d{2})$/);
    
    if (!startMatch || !endMatch) {
      return false;
    }
    
    const startHours = parseInt(startMatch[1], 10);
    const startMinutes = parseInt(startMatch[2], 10);
    const endHours = parseInt(endMatch[1], 10);
    const endMinutes = parseInt(endMatch[2], 10);
    
    // Validate ranges
    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      return false;
    }
    
    if (startHours < 0 || startHours > 23 || startMinutes < 0 || startMinutes > 59) {
      return false;
    }
    if (endHours < 0 || endHours > 23 || endMinutes < 0 || endMinutes > 59) {
      return false;
    }
    
    // Compare times in minutes
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    // End time must be after start time (at least 1 minute difference)
    return endTotalMinutes > startTotalMinutes;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

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

router.post('/pt-sessions/:sessionId/cancel', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const sessionId = parseInt(req.params.sessionId);
    const reason = req.body.reason;

    const session = await memberService.cancelPTSession(sessionId, member.memberId, reason);
    res.json(session);
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

// Get available rooms for booking
router.get('/rooms', async (req: AuthRequest, res, next) => {
  try {
    const rooms = await memberService.getAvailableRooms();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

// Get available classes with upcoming schedules
router.get('/classes', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const classes = await memberService.getAvailableClasses(member.memberId);
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

// Cancel class registration
router.post('/classes/registrations/:registrationId/cancel', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const registrationId = parseInt(req.params.registrationId);
    const result = await memberService.cancelClassRegistration(registrationId, member.memberId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Billing & Payments
// Get all bills for the member
router.get('/bills', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const bills = await memberService.getMemberBills(member.memberId);
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

// Get a specific bill
router.get('/bills/:billId', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const billId = parseInt(req.params.billId);
    const bill = await memberService.getMemberBill(member.memberId, billId);
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

// Process payment for a bill
router.post('/bills/:billId/pay', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { user_id: req.userId! },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const billId = parseInt(req.params.billId);
    const paymentSchema = z.object({
      paymentMethod: z.enum(['credit_card', 'debit', 'cash', 'e_transfer']),
    });

    const validatedData = paymentSchema.parse(req.body);
    const bill = await memberService.processPayment(member.memberId, billId, validatedData);
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

export default router;

