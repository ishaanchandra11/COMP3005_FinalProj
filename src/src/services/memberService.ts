import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const memberService = {
  // Get member dashboard data
  async getDashboard(memberId: number) {
    const member = await prisma.member.findUnique({
      where: { memberId },
      include: {
        fitnessGoals: {
          where: { status: 'active' },
        },
        healthMetrics: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        ptSessions: {
          where: {
            status: 'scheduled',
            OR: [
              { scheduledDate: { gt: new Date() } },
              {
                scheduledDate: { equals: new Date() },
                startTime: { gt: new Date() },
              },
            ],
          },
          take: 5,
          orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
        },
        classRegistrations: {
          include: {
            schedule: {
              include: {
                groupClass: true,
              },
            },
          },
          take: 10,
        },
        bills: {
          where: {
            status: { in: ['pending', 'overdue'] },
          },
        },
      },
    });

    if (!member) {
      throw new AppError(404, 'Member not found');
    }

    // Calculate stats
    const totalClassesAttended = await prisma.classRegistration.count({
      where: {
        memberId,
        attendance_status: 'attended',
      },
    });

    const totalPTSessions = await prisma.personalTrainingSession.count({
      where: {
        memberId,
        status: 'completed',
      },
    });

    const latestMetric = member.healthMetrics[0];
    const weightChange30Days = latestMetric ? await (async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const oldMetric = await prisma.healthMetric.findFirst({
        where: {
          memberId,
          recordedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { recordedAt: 'asc' },
      });
      return oldMetric && latestMetric.weight ? 
        Number(latestMetric.weight) - Number(oldMetric.weight) : null;
    })() : null;

    // Filter upcoming classes
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcomingClasses = member.classRegistrations.filter(cr => {
      if (cr.attendance_status !== 'registered') return false;
      const schedule = cr.schedule;
      if (!schedule) return false;
      const scheduleDate = new Date(schedule.scheduledDate);
      if (scheduleDate > today) return true;
      if (scheduleDate.getTime() === today.getTime()) {
        const startTime = new Date(schedule.startTime);
        return startTime > now;
      }
      return false;
    });

    return {
      memberId: member.memberId,
      firstName: member.firstName,
      lastName: member.lastName,
      membershipStatus: member.membershipStatus,
      latestWeight: latestMetric?.weight,
      latestBmi: latestMetric?.bmi,
      lastMetricDate: latestMetric?.recordedAt,
      weightChange30Days,
      activeGoalsCount: member.fitnessGoals.length,
      totalClassesAttended,
      totalPTSessions,
      upcomingPTSessions: member.ptSessions.length,
      upcomingClasses: upcomingClasses.length,
      outstandingBalance: member.bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0),
    };
  },

  // Update member profile
  async updateProfile(memberId: number, data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  }) {
    return await prisma.member.update({
      where: { memberId },
      data,
    });
  },

  // Add health metric (historical, never overwrites)
  async addHealthMetric(memberId: number, data: {
    weight?: number;
    height?: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    restingHeartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    notes?: string;
  }) {
    return await prisma.healthMetric.create({
      data: {
        memberId,
        ...data,
        recordedAt: new Date(),
      },
    });
  },

  // Get health metrics history
  async getHealthMetrics(memberId: number, limit?: number) {
    return await prisma.healthMetric.findMany({
      where: { memberId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  },

  // Create fitness goal
  async createGoal(memberId: number, data: {
    goalType: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_fitness';
    targetValue: number;
    targetDate: Date;
    currentValue?: number;
    notes?: string;
  }) {
    return await prisma.fitnessGoal.create({
      data: {
        memberId,
        ...data,
      },
    });
  },

  // Get fitness goals
  async getGoals(memberId: number, status?: 'active' | 'achieved' | 'paused' | 'cancelled') {
    return await prisma.fitnessGoal.findMany({
      where: {
        memberId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Update fitness goal
  async updateGoal(goalId: number, memberId: number, data: {
    targetValue?: number;
    currentValue?: number;
    targetDate?: Date;
    status?: 'active' | 'achieved' | 'paused' | 'cancelled';
    notes?: string;
  }) {
    // Verify goal belongs to member
    const goal = await prisma.fitnessGoal.findFirst({
      where: { goalId, memberId },
    });

    if (!goal) {
      throw new AppError(404, 'Goal not found');
    }

    return await prisma.fitnessGoal.update({
      where: { goalId },
      data: {
        ...data,
        ...(data.status === 'achieved' && !goal.achievedAt && { achievedAt: new Date() }),
      },
    });
  },

  // Book personal training session
  async bookPTSession(memberId: number, data: {
    trainerId: number;
    roomId?: number;
    scheduledDate: Date;
    startTime: string;
    endTime: string;
  }) {
    // Check trainer availability
    const trainer = await prisma.trainer.findUnique({
      where: { trainerId: data.trainerId },
    });

    if (!trainer) {
      throw new AppError(404, 'Trainer not found');
    }

    const startTimeObj = new Date(`1970-01-01T${data.startTime}`);
    const endTimeObj = new Date(`1970-01-01T${data.endTime}`);

    // Check for member conflicts
    const memberConflict = await prisma.personalTrainingSession.findFirst({
      where: {
        memberId,
        scheduledDate: data.scheduledDate,
        status: 'scheduled',
        AND: [
          { startTime: { lt: endTimeObj } },
          { endTime: { gt: startTimeObj } },
        ],
      },
    });

    if (memberConflict) {
      throw new AppError(409, 'You already have a session booked at this time');
    }

    // Check for trainer conflicts
    const trainerConflict = await prisma.personalTrainingSession.findFirst({
      where: {
        trainerId: data.trainerId,
        scheduledDate: data.scheduledDate,
        status: 'scheduled',
        AND: [
          { startTime: { lt: endTimeObj } },
          { endTime: { gt: startTimeObj } },
        ],
      },
    });

    if (trainerConflict) {
      throw new AppError(409, 'Trainer is already booked at this time');
    }

    // Check for room conflicts if room is specified
    if (data.roomId) {
      const roomConflictPT = await prisma.personalTrainingSession.findFirst({
        where: {
          roomId: data.roomId,
          scheduledDate: data.scheduledDate,
          status: 'scheduled',
          AND: [
            { startTime: { lt: endTimeObj } },
            { endTime: { gt: startTimeObj } },
          ],
        },
      });

      if (roomConflictPT) {
        throw new AppError(409, 'Room is already booked at this time');
      }

      const roomConflictClass = await prisma.classSchedule.findFirst({
        where: {
          roomId: data.roomId,
          scheduledDate: data.scheduledDate,
          status: 'scheduled',
          AND: [
            { startTime: { lt: endTimeObj } },
            { endTime: { gt: startTimeObj } },
          ],
        },
      });

      if (roomConflictClass) {
        throw new AppError(409, 'Room is already booked for a class at this time');
      }
    }

    return await prisma.personalTrainingSession.create({
      data: {
        memberId,
        trainerId: data.trainerId,
        roomId: data.roomId,
        scheduledDate: data.scheduledDate,
        startTime: startTimeObj,
        endTime: endTimeObj,
      },
      include: {
        trainer: {
          select: {
            firstName: true,
            lastName: true,
            trainerId: true,
          },
        },
        room: {
          select: {
            roomName: true,
            roomId: true,
          },
        },
      },
    });
  },

  // Get upcoming PT sessions
  async getUpcomingSessions(memberId: number) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return await prisma.personalTrainingSession.findMany({
      where: {
        memberId,
        status: 'scheduled',
        OR: [
          { scheduledDate: { gt: today } },
          {
            scheduledDate: { equals: today },
            startTime: { gt: now },
          },
        ],
      },
      include: {
        trainer: {
          select: {
            firstName: true,
            lastName: true,
            trainerId: true,
          },
        },
        room: {
          select: {
            roomName: true,
            roomId: true,
          },
        },
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { startTime: 'asc' },
      ],
    });
  },

  // Register for group class
  async registerForClass(memberId: number, scheduleId: number) {
    // Check if already registered
    const existing = await prisma.classRegistration.findFirst({
      where: {
        memberId,
        scheduleId,
      },
    });

    if (existing) {
      throw new AppError(409, 'Already registered for this class');
    }

    // Check class capacity
    const schedule = await prisma.classSchedule.findUnique({
      where: { scheduleId },
      include: { groupClass: true },
    });

    if (!schedule) {
      throw new AppError(404, 'Class schedule not found');
    }

    if (schedule.status !== 'scheduled') {
      throw new AppError(400, 'Class is not available for registration');
    }

    if (schedule.currentCapacity >= schedule.groupClass.maxCapacity) {
      // Add to waitlist
      const waitlistPosition = await prisma.classRegistration.count({
        where: {
          scheduleId,
          waitlistPosition: { not: null },
        },
      });

      return await prisma.classRegistration.create({
        data: {
          memberId,
          scheduleId,
          waitlistPosition: waitlistPosition + 1,
        },
        include: {
          schedule: {
            include: {
              groupClass: true,
              trainer: true,
              room: true,
            },
          },
        },
      });
    }

    // Regular registration
    return await prisma.classRegistration.create({
      data: {
        memberId,
        scheduleId,
      },
      include: {
        schedule: {
          include: {
            groupClass: true,
            trainer: true,
            room: true,
          },
        },
      },
    });
  },

  // Get class registrations
  async getClassRegistrations(memberId: number) {
    return await prisma.classRegistration.findMany({
      where: { memberId },
      include: {
        schedule: {
          include: {
            groupClass: true,
            trainer: true,
            room: true,
          },
        },
      },
      orderBy: {
        schedule: {
          scheduledDate: 'asc',
        },
      },
    });
  },
};

