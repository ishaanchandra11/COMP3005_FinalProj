import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { adminService } from '../services/adminService';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard stats
router.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Room Management
router.get('/rooms', async (req: AuthRequest, res, next) => {
  try {
    const rooms = await adminService.getAllRooms();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

router.get('/rooms/:id', async (req: AuthRequest, res, next) => {
  try {
    const roomId = parseInt(req.params.id);
    const room = await adminService.getRoom(roomId);
    res.json(room);
  } catch (error) {
    next(error);
  }
});

const createRoomSchema = z.object({
  roomName: z.string().min(1),
  roomType: z.enum(['gym_floor', 'studio', 'pool', 'court']),
  capacity: z.number().int().positive(),
  hasEquipment: z.boolean(),
  description: z.string().optional(),
});

router.post('/rooms', async (req: AuthRequest, res, next) => {
  try {
    const validatedData = createRoomSchema.parse(req.body);
    const room = await adminService.createRoom(validatedData);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
});

router.put('/rooms/:id', async (req: AuthRequest, res, next) => {
  try {
    const roomId = parseInt(req.params.id);
    const updateSchema = z.object({
      roomName: z.string().optional(),
      capacity: z.number().int().positive().optional(),
      hasEquipment: z.boolean().optional(),
      isActive: z.boolean().optional(),
      description: z.string().optional(),
    });

    const validatedData = updateSchema.parse(req.body);
    const room = await adminService.updateRoom(roomId, validatedData);
    res.json(room);
  } catch (error) {
    next(error);
  }
});

// Equipment Management
router.get('/equipment', async (req: AuthRequest, res, next) => {
  try {
    const equipment = await adminService.getAllEquipment();
    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

router.get('/equipment/:id', async (req: AuthRequest, res, next) => {
  try {
    const equipmentId = parseInt(req.params.id);
    const equipment = await adminService.getEquipment(equipmentId);
    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

const maintenanceSchema = z.object({
  issueDescription: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignedTo: z.number().int().optional(),
});

router.post('/equipment/:id/maintenance', async (req: AuthRequest, res, next) => {
  try {
    const equipmentId = parseInt(req.params.id);
    const validatedData = maintenanceSchema.parse(req.body);
    const log = await adminService.reportMaintenance(equipmentId, req.userId!, validatedData);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

router.get('/maintenance', async (req: AuthRequest, res, next) => {
  try {
    const status = req.query.status as any;
    const logs = await adminService.getMaintenanceLogs(status);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

router.put('/maintenance/:id', async (req: AuthRequest, res, next) => {
  try {
    const logId = parseInt(req.params.id);
    const admin = await prisma.admin.findUnique({
      where: { user_id: req.userId! },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const updateSchema = z.object({
      status: z.enum(['in_progress', 'resolved', 'cancelled']),
      resolutionNotes: z.string().optional(),
      cost: z.number().optional(),
    });

    const validatedData = updateSchema.parse(req.body);
    const log = await adminService.updateMaintenanceStatus(logId, admin.adminId, validatedData);
    res.json(log);
  } catch (error) {
    next(error);
  }
});

// Class Schedule Management
router.get('/classes', async (req: AuthRequest, res, next) => {
  try {
    const classes = await adminService.getAllClasses();
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

const createClassScheduleSchema = z.object({
  classId: z.number().int().positive(),
  trainerId: z.number().int().positive(),
  roomId: z.number().int().positive(),
  scheduledDate: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

router.post('/classes/schedule', async (req: AuthRequest, res, next) => {
  try {
    const validatedData = createClassScheduleSchema.parse(req.body);
    const schedule = await adminService.createClassSchedule(validatedData);
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
});

router.put('/classes/schedule/:id', async (req: AuthRequest, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const updateSchema = z.object({
      trainerId: z.number().int().positive().optional(),
      roomId: z.number().int().positive().optional(),
      scheduledDate: z.string().transform((str) => new Date(str)).optional(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
      cancellationReason: z.string().optional(),
    });

    const validatedData = updateSchema.parse(req.body);
    const schedule = await adminService.updateClassSchedule(scheduleId, validatedData);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.post('/classes/schedule/:id/cancel', async (req: AuthRequest, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const reason = req.body.reason || 'Cancelled by admin';
    const schedule = await adminService.cancelClassSchedule(scheduleId, reason);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

// Billing & Payments
router.get('/bills', async (req: AuthRequest, res, next) => {
  try {
    const status = req.query.status as any;
    const bills = await adminService.getAllBills(status);
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

const createBillSchema = z.object({
  memberId: z.number().int().positive(),
  dueDate: z.string().transform((str) => new Date(str)),
  items: z.array(z.object({
    itemType: z.enum(['membership', 'personal_training', 'class', 'product', 'other']),
    description: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    relatedSessionId: z.number().int().optional(),
    relatedClassId: z.number().int().optional(),
  })),
  notes: z.string().optional(),
});

router.post('/bills', async (req: AuthRequest, res, next) => {
  try {
    const validatedData = createBillSchema.parse(req.body);
    const bill = await adminService.createBill(validatedData.memberId, validatedData);
    res.status(201).json(bill);
  } catch (error) {
    next(error);
  }
});

// More specific route must come before generic /bills/:id
router.post('/bills/:id/pay', async (req: AuthRequest, res, next) => {
  try {
    const billId = parseInt(req.params.id);
    const paymentSchema = z.object({
      paymentMethod: z.enum(['credit_card', 'debit', 'cash', 'e_transfer']),
    });

    const validatedData = paymentSchema.parse(req.body);
    const bill = await adminService.processPayment(billId, validatedData);
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

router.get('/bills/:id', async (req: AuthRequest, res, next) => {
  try {
    const billId = parseInt(req.params.id);
    const bill = await adminService.getBill(billId);
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

export default router;

