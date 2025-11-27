import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

// Helper function to format time from Date object
// Prisma TIME values are returned as Date objects without timezone info (no 'Z' suffix)
// When Date is created without 'Z', it's interpreted in local time
// So we must use getHours()/getMinutes() (local) not getUTCHours() (which would shift the time)
const formatTime = (timeDate: Date): string => {
  const hours = timeDate.getHours().toString().padStart(2, '0');
  const minutes = timeDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const adminService = {
  // Room Management
  async getAllRooms() {
    return await prisma.room.findMany({
      include: {
        equipment: {
          where: {
            status: { not: 'out_of_service' },
          },
        },
      },
      orderBy: { roomName: 'asc' },
    });
  },

  async getRoom(roomId: number) {
    const room = await prisma.room.findUnique({
      where: { roomId },
      include: {
        equipment: true,
        classSchedules: {
          where: {
            scheduledDate: { gte: new Date() },
            status: 'scheduled',
          },
          include: {
            groupClass: true,
            trainer: true,
          },
          orderBy: [
            { scheduledDate: 'asc' },
            { startTime: 'asc' },
          ],
        },
        ptSessions: {
          where: {
            scheduledDate: { gte: new Date() },
            status: 'scheduled',
          },
          include: {
            member: true,
            trainer: true,
          },
          orderBy: [
            { scheduledDate: 'asc' },
            { startTime: 'asc' },
          ],
        },
      },
    });

    if (!room) {
      throw new AppError(404, 'Room not found');
    }

    return room;
  },

  async createRoom(data: {
    roomName: string;
    roomType: 'gym_floor' | 'studio' | 'pool' | 'court';
    capacity: number;
    hasEquipment: boolean;
    description?: string;
  }) {
    return await prisma.room.create({
      data,
    });
  },

  async updateRoom(roomId: number, data: {
    roomName?: string;
    capacity?: number;
    hasEquipment?: boolean;
    isActive?: boolean;
    description?: string;
  }) {
    return await prisma.room.update({
      where: { roomId },
      data,
    });
  },

  // Equipment Management
  async getAllEquipment() {
    return await prisma.equipment.findMany({
      include: {
        room: {
          select: {
            roomName: true,
            roomId: true,
          },
        },
        maintenanceLogs: {
          where: {
            status: { in: ['reported', 'in_progress'] },
          },
          orderBy: { reportedDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { equipmentName: 'asc' },
    });
  },

  async getEquipment(equipmentId: number) {
    const equipment = await prisma.equipment.findUnique({
      where: { equipmentId },
      include: {
        room: true,
        maintenanceLogs: {
          orderBy: { reportedDate: 'desc' },
        },
      },
    });

    if (!equipment) {
      throw new AppError(404, 'Equipment not found');
    }

    return equipment;
  },

  async reportMaintenance(equipmentId: number, reportedBy: number, data: {
    issueDescription: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo?: number;
  }) {
    return await prisma.maintenanceLog.create({
      data: {
        equipmentId,
        reportedBy,
        assignedTo: data.assignedTo,
        issueDescription: data.issueDescription,
        priority: data.priority,
        status: 'reported',
      },
      include: {
        equipment: true,
        admin: true,
      },
    });
  },

  async updateMaintenanceStatus(logId: number, adminId: number, data: {
    status: 'in_progress' | 'resolved' | 'cancelled';
    resolutionNotes?: string;
    cost?: number;
  }) {
    const log = await prisma.maintenanceLog.findUnique({
      where: { logId },
    });

    if (!log) {
      throw new AppError(404, 'Maintenance log not found');
    }

    const updateData: any = {
      status: data.status,
      assignedTo: adminId,
    };

    if (data.status === 'resolved') {
      updateData.resolvedDate = new Date();
      updateData.resolutionNotes = data.resolutionNotes;
      updateData.cost = data.cost;

      // Get current equipment to check dates
      const equipment = await prisma.equipment.findUnique({
        where: { equipmentId: log.equipmentId },
        select: {
          purchaseDate: true,
          lastMaintenanceDate: true,
          nextMaintenanceDue: true,
        },
      });

      if (!equipment) {
        throw new AppError(404, 'Equipment not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Prepare equipment update data
      const equipmentUpdateData: any = {
        status: 'operational',
        lastMaintenanceDate: today,
      };

      // Ensure lastMaintenanceDate >= purchaseDate
      if (equipment.purchaseDate && today < equipment.purchaseDate) {
        throw new AppError(400, 'Last maintenance date cannot be before purchase date');
      }

      // If nextMaintenanceDue exists and is before or equal to the new lastMaintenanceDate,
      // update it to be 30 days in the future (or keep it if it's already in the future)
      if (equipment.nextMaintenanceDue) {
        const nextDue = new Date(equipment.nextMaintenanceDue);
        nextDue.setHours(0, 0, 0, 0);
        
        if (nextDue <= today) {
          // Set next maintenance due to 30 days from now
          const futureDate = new Date(today);
          futureDate.setDate(futureDate.getDate() + 30);
          equipmentUpdateData.nextMaintenanceDue = futureDate;
        }
        // If nextMaintenanceDue is already in the future, keep it as is
      } else {
        // If no nextMaintenanceDue set, set it to 30 days from now
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 30);
        equipmentUpdateData.nextMaintenanceDue = futureDate;
      }

      // Update equipment status
      await prisma.equipment.update({
        where: { equipmentId: log.equipmentId },
        data: equipmentUpdateData,
      });
    }

    return await prisma.maintenanceLog.update({
      where: { logId },
      data: updateData,
      include: {
        equipment: true,
        admin: true,
      },
    });
  },

  async getMaintenanceLogs(status?: 'reported' | 'in_progress' | 'resolved' | 'cancelled') {
    return await prisma.maintenanceLog.findMany({
      where: status ? { status } : undefined,
      include: {
        equipment: {
          include: {
            room: true,
          },
        },
        admin: true,
      },
      orderBy: { reportedDate: 'desc' },
    });
  },

  // Class Schedule Management
  async getAllClasses() {
    // Get start of today to include all classes scheduled for today or later
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const classes = await prisma.groupClass.findMany({
      include: {
        classSchedules: {
          where: {
            scheduledDate: { gte: today },
          },
          include: {
            trainer: true,
            room: true,
          },
          orderBy: { scheduledDate: 'asc' },
        },
      },
      orderBy: { className: 'asc' },
    });

    // Format times to HH:MM strings
    return classes.map(groupClass => ({
      ...groupClass,
      classSchedules: groupClass.classSchedules.map(schedule => ({
        ...schedule,
        startTime: formatTime(schedule.startTime),
        endTime: formatTime(schedule.endTime),
      })),
    }));
  },

  async createClassSchedule(data: {
    classId: number;
    trainerId: number;
    roomId: number;
    scheduledDate: Date;
    startTime: string;
    endTime: string;
    description?: string;
  }) {
    // Check room availability
    const roomConflict = await prisma.classSchedule.findFirst({
      where: {
        roomId: data.roomId,
        scheduledDate: data.scheduledDate,
        status: 'scheduled',
        startTime: { lte: new Date(`1970-01-01T${data.endTime}`) },
        endTime: { gte: new Date(`1970-01-01T${data.startTime}`) },
      },
    });

    if (roomConflict) {
      throw new AppError(409, 'Room is already booked for this time slot');
    }

    const ptConflict = await prisma.personalTrainingSession.findFirst({
      where: {
        roomId: data.roomId,
        scheduledDate: data.scheduledDate,
        status: 'scheduled',
        startTime: { lte: new Date(`1970-01-01T${data.endTime}`) },
        endTime: { gte: new Date(`1970-01-01T${data.startTime}`) },
      },
    });

    if (ptConflict) {
      throw new AppError(409, 'Room is already booked for this time slot');
    }

    // Format date properly - ensure it's a Date object
    const scheduledDate = data.scheduledDate instanceof Date 
      ? data.scheduledDate 
      : new Date(data.scheduledDate);
    
    return await prisma.classSchedule.create({
      data: {
        classId: data.classId,
        trainerId: data.trainerId,
        roomId: data.roomId,
        scheduledDate: scheduledDate,
        startTime: new Date(`1970-01-01T${data.startTime}:00`),
        endTime: new Date(`1970-01-01T${data.endTime}:00`),
        notes: data.description || null,
      },
      include: {
        groupClass: true,
        trainer: true,
        room: true,
      },
    });
  },

  async updateClassSchedule(scheduleId: number, data: {
    trainerId?: number;
    roomId?: number;
    scheduledDate?: Date;
    startTime?: string;
    endTime?: string;
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    cancellationReason?: string;
  }) {
    return await prisma.classSchedule.update({
      where: { scheduleId },
      data: {
        ...data,
        ...(data.startTime && { startTime: new Date(`1970-01-01T${data.startTime}`) }),
        ...(data.endTime && { endTime: new Date(`1970-01-01T${data.endTime}`) }),
      },
      include: {
        groupClass: true,
        trainer: true,
        room: true,
      },
    });
  },

  async deleteClassSchedule(scheduleId: number) {
    // Check if there are any registrations
    const registrations = await prisma.classRegistration.count({
      where: { scheduleId },
    });

    if (registrations > 0) {
      throw new AppError(400, `Cannot delete class schedule. There are ${registrations} member(s) registered for this class. Please cancel the class instead.`);
    }

    await prisma.classSchedule.delete({
      where: { scheduleId },
    });

    return { message: 'Class schedule deleted successfully' };
  },

  async cancelClassSchedule(scheduleId: number, reason: string) {
    return await prisma.classSchedule.update({
      where: { scheduleId },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
      },
      include: {
        groupClass: true,
        trainer: true,
        room: true,
      },
    });
  },

  // Billing & Payments
  async getAllBills(status?: 'pending' | 'paid' | 'overdue' | 'cancelled') {
    return await prisma.bill.findMany({
      where: status ? { status } : undefined,
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberId: true,
          },
        },
        items: true,
      },
      orderBy: { generatedDate: 'desc' },
    });
  },

  async getBill(billId: number) {
    const bill = await prisma.bill.findUnique({
      where: { billId },
      include: {
        member: true,
        items: {
          include: {
            ptSession: {
              include: {
                trainer: true,
              },
            },
            classSchedule: {
              include: {
                groupClass: true,
                trainer: true,
              },
            },
          },
        },
      },
    });

    if (!bill) {
      throw new AppError(404, 'Bill not found');
    }

    return bill;
  },

  async createBill(memberId: number, data: {
    dueDate: Date;
    items: Array<{
      itemType: 'membership' | 'personal_training' | 'class' | 'product' | 'other';
      description: string;
      quantity: number;
      unitPrice: number;
      relatedSessionId?: number;
      relatedClassId?: number;
    }>;
    notes?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const bill = await tx.bill.create({
        data: {
          memberId,
          dueDate: data.dueDate,
          subtotal: 0, // Will be updated by trigger
          notes: data.notes,
        },
      });

      await Promise.all(
        data.items.map(item =>
          tx.billItem.create({
            data: {
              billId: bill.billId,
              itemType: item.itemType,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              relatedSessionId: item.relatedSessionId,
              relatedClassId: item.relatedClassId,
            },
          })
        )
      );

      // Recalculate subtotal
      const items = await tx.billItem.findMany({
        where: { billId: bill.billId },
      });

      const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

      return await tx.bill.update({
        where: { billId: bill.billId },
        data: { subtotal },
        include: {
          items: true,
          member: true,
        },
      });
    });
  },

  async processPayment(billId: number, data: {
    paymentMethod: 'credit_card' | 'debit' | 'cash' | 'e_transfer';
  }) {
    const bill = await prisma.bill.findUnique({
      where: { billId },
    });

    if (!bill) {
      throw new AppError(404, 'Bill not found');
    }

    if (bill.status === 'paid') {
      throw new AppError(400, 'Bill is already paid');
    }

    return await prisma.bill.update({
      where: { billId },
      data: {
        status: 'paid',
        paymentMethod: data.paymentMethod,
        paidAt: new Date(),
      },
      include: {
        items: true,
        member: true,
      },
    });
  },

  // Dashboard/Stats
  async getDashboardStats() {
    const [
      totalMembers,
      activeMembers,
      totalTrainers,
      activeClasses,
      upcomingClasses,
      pendingBills,
      overdueBills,
      equipmentNeedingMaintenance,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { membershipStatus: 'active' } }),
      prisma.trainer.count(),
      // Active classes = group classes that are active (isActive = true)
      prisma.groupClass.count({ where: { isActive: true } }),
      prisma.classSchedule.count({
        where: {
          scheduledDate: { gte: new Date() },
          status: 'scheduled',
        },
      }),
      prisma.bill.count({ where: { status: 'pending' } }),
      prisma.bill.count({ where: { status: 'overdue' } }),
      prisma.equipment.count({
        where: {
          status: { in: ['needs_maintenance', 'under_repair'] },
        },
      }),
    ]);

    return {
      totalMembers,
      activeMembers,
      totalTrainers,
      activeClasses,
      upcomingClasses,
      pendingBills,
      overdueBills,
      equipmentNeedingMaintenance,
    };
  },
};

