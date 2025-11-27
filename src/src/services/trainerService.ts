import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const trainerService = {
  // Set availability
  async setAvailability(trainerId: number, data: {
    dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    startTime: string;
    endTime: string;
    isRecurring?: boolean;
    effectiveDate?: Date;
    endDate?: Date;
  }) {
    // Check for overlapping availability
    const existing = await prisma.trainerAvailability.findFirst({
      where: {
        trainerId,
        dayOfWeek: data.dayOfWeek,
        isRecurring: data.isRecurring ?? true,
        OR: [
          {
            effectiveDate: { lte: data.endDate || new Date('2099-12-31') },
            endDate: { gte: data.effectiveDate || new Date() },
          },
          {
            effectiveDate: { lte: data.endDate || new Date('2099-12-31') },
            endDate: null,
          },
        ],
      },
    });

    if (existing) {
      // Check if times overlap
      const existingStart = existing.startTime.toString().substring(0, 5);
      const existingEnd = existing.endTime.toString().substring(0, 5);
      if (
        (data.startTime < existingEnd && data.endTime > existingStart) ||
        (data.startTime === existingStart && data.endTime === existingEnd)
      ) {
        throw new AppError(409, 'Availability slot overlaps with existing schedule');
      }
    }

    return await prisma.trainerAvailability.create({
      data: {
        trainerId,
        dayOfWeek: data.dayOfWeek,
        startTime: new Date(`1970-01-01T${data.startTime}`),
        endTime: new Date(`1970-01-01T${data.endTime}`),
        isRecurring: data.isRecurring ?? true,
        effectiveDate: data.effectiveDate || new Date(),
        endDate: data.endDate,
      },
    });
  },

  // Get trainer schedule (PT sessions + classes)
  async getSchedule(trainerId: number, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Get PT sessions
    const ptSessions = await prisma.personalTrainingSession.findMany({
      where: {
        trainerId,
        scheduledDate: {
          gte: start,
          lte: end,
        },
        status: 'scheduled',
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberId: true,
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

    // Get class schedules
    const classSchedules = await prisma.classSchedule.findMany({
      where: {
        trainerId,
        scheduledDate: {
          gte: start,
          lte: end,
        },
        status: 'scheduled',
      },
      include: {
        groupClass: {
          select: {
            className: true,
            classType: true,
            durationMinutes: true,
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

    return {
      ptSessions: ptSessions.map(s => ({
        id: s.sessionId,
        type: 'PT Session',
        date: s.scheduledDate,
        startTime: s.startTime.toString().substring(0, 5),
        endTime: s.endTime.toString().substring(0, 5),
        member: s.member ? `${s.member.firstName} ${s.member.lastName}` : null,
        room: s.room?.roomName || null,
        status: s.status,
      })),
      classes: classSchedules.map(c => ({
        id: c.scheduleId,
        type: 'Group Class',
        date: c.scheduledDate,
        startTime: c.startTime.toString().substring(0, 5),
        endTime: c.endTime.toString().substring(0, 5),
        className: c.groupClass.className,
        classType: c.groupClass.classType,
        room: c.room?.roomName || null,
        capacity: `${c.currentCapacity}/${c.groupClass.maxCapacity}`,
        status: c.status,
      })),
    };
  },

  // Search members (read-only, case-insensitive)
  async searchMembers(searchTerm: string) {
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        memberId: true,
        firstName: true,
        lastName: true,
        membershipStatus: true,
      },
      take: 20,
    });

    // Get latest health metric and active goal for each member
    const membersWithData = await Promise.all(
      members.map(async (member) => {
        const latestMetric = await prisma.healthMetric.findFirst({
          where: { memberId: member.memberId },
          orderBy: { recordedAt: 'desc' },
          select: {
            weight: true,
            bmi: true,
            recordedAt: true,
          },
        });

        const activeGoal = await prisma.fitnessGoal.findFirst({
          where: {
            memberId: member.memberId,
            status: 'active',
          },
          select: {
            goalType: true,
            targetValue: true,
            currentValue: true,
            targetDate: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        return {
          memberId: member.memberId,
          name: `${member.firstName} ${member.lastName}`,
          membershipStatus: member.membershipStatus,
          latestMetric: latestMetric ? {
            weight: latestMetric.weight,
            bmi: latestMetric.bmi,
            recordedAt: latestMetric.recordedAt,
          } : null,
          activeGoal: activeGoal ? {
            goalType: activeGoal.goalType,
            targetValue: activeGoal.targetValue,
            currentValue: activeGoal.currentValue,
            targetDate: activeGoal.targetDate,
          } : null,
        };
      })
    );

    return membersWithData;
  },

  // Get trainer availability
  async getAvailability(trainerId: number) {
    return await prisma.trainerAvailability.findMany({
      where: {
        trainerId,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  },

  // Delete availability slot
  async deleteAvailability(availabilityId: number, trainerId: number) {
    const availability = await prisma.trainerAvailability.findFirst({
      where: {
        availabilityId,
        trainerId,
      },
    });

    if (!availability) {
      throw new AppError(404, 'Availability slot not found');
    }

    return await prisma.trainerAvailability.delete({
      where: { availabilityId },
    });
  },
};

