import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

// Helper function to format time from Date object
// Since we store times using Date.UTC(), we need to use UTC methods to extract them
const formatTime = (timeDate: Date): string => {
  const hours = timeDate.getUTCHours().toString().padStart(2, '0');
  const minutes = timeDate.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

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
    // Validate time format and ensure endTime > startTime
    const startTimeStr = data.startTime.trim();
    const endTimeStr = data.endTime.trim();
    
    // Parse times to validate
    const startMatch = startTimeStr.match(/^(\d{2}):(\d{2})$/);
    const endMatch = endTimeStr.match(/^(\d{2}):(\d{2})$/);
    
    if (!startMatch || !endMatch) {
      throw new AppError(400, 'Invalid time format. Expected HH:MM format (e.g., 09:00, 17:30)');
    }
    
    const startHours = parseInt(startMatch[1], 10);
    const startMinutes = parseInt(startMatch[2], 10);
    const endHours = parseInt(endMatch[1], 10);
    const endMinutes = parseInt(endMatch[2], 10);
    
    // Validate time ranges
    if (startHours < 0 || startHours > 23 || startMinutes < 0 || startMinutes > 59) {
      throw new AppError(400, 'Invalid start time. Hours must be 0-23 and minutes must be 0-59');
    }
    
    if (endHours < 0 || endHours > 23 || endMinutes < 0 || endMinutes > 59) {
      throw new AppError(400, 'Invalid end time. Hours must be 0-23 and minutes must be 0-59');
    }
    
    // Calculate total minutes for comparison
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    // Check if end time is after start time (MUST be strictly greater)
    if (endTotalMinutes <= startTotalMinutes) {
      // Double-check: log if this error occurs (shouldn't happen for valid times)
      console.error('Time validation failed:', {
        startTimeStr,
        endTimeStr,
        startHours,
        startMinutes,
        endHours,
        endMinutes,
        startTotalMinutes,
        endTotalMinutes,
        comparison: endTotalMinutes <= startTotalMinutes
      });
      throw new AppError(400, `Invalid time range: End time (${endTimeStr}) must be AFTER start time (${startTimeStr}). The end time cannot be the same as or before the start time. If availability spans midnight, please split into two separate entries.`);
    }
    
    // Create Date objects for the times (needed for Prisma)
    // Use UTC methods to ensure the exact time is stored without timezone conversion
    // Prisma TIME type stores time without timezone, so we extract hours/minutes and create UTC Date
    const startTimeDate = new Date(Date.UTC(1970, 0, 1, startHours, startMinutes, 0));
    const endTimeDate = new Date(Date.UTC(1970, 0, 1, endHours, endMinutes, 0));
    
    // Verify Date objects are valid (time validation already done above with minutes)
    if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
      throw new AppError(400, 'Invalid time values. Please use HH:MM format (e.g., 09:00, 17:30)');
    }
    
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
      // Check if times overlap - format existing times properly using UTC methods
      const existingStartHours = existing.startTime.getUTCHours();
      const existingStartMinutes = existing.startTime.getUTCMinutes();
      const existingEndHours = existing.endTime.getUTCHours();
      const existingEndMinutes = existing.endTime.getUTCMinutes();
      
      const existingStartTotal = existingStartHours * 60 + existingStartMinutes;
      const existingEndTotal = existingEndHours * 60 + existingEndMinutes;
      
      // Check for overlap: new start < existing end AND new end > existing start
      if (
        (startTotalMinutes < existingEndTotal && endTotalMinutes > existingStartTotal) ||
        (startTotalMinutes === existingStartTotal && endTotalMinutes === existingEndTotal)
      ) {
        throw new AppError(409, 'Availability slot overlaps with existing schedule');
      }
    }

    try {
      return await prisma.trainerAvailability.create({
        data: {
          trainerId,
          dayOfWeek: data.dayOfWeek,
          startTime: startTimeDate,
          endTime: endTimeDate,
          isRecurring: data.isRecurring ?? true,
          effectiveDate: data.effectiveDate || new Date(),
          endDate: data.endDate,
        },
      });
    } catch (error: any) {
      // Catch any database constraint violations that might have slipped through
      if (error?.message && error.message.includes('valid_availability_time')) {
        throw new AppError(400, `Invalid time range: End time (${endTimeStr}) must be after start time (${startTimeStr}). The end time cannot be the same as or before the start time.`);
      }
      throw error; // Re-throw if it's a different error
    }
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
            maxCapacity: true,
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
        startTime: formatTime(s.startTime),
        endTime: formatTime(s.endTime),
        member: s.member ? `${s.member.firstName} ${s.member.lastName}` : null,
        room: s.room?.roomName || null,
        status: s.status,
      })),
      classes: classSchedules.map(c => ({
        id: c.scheduleId,
        type: 'Group Class',
        date: c.scheduledDate,
        startTime: formatTime(c.startTime),
        endTime: formatTime(c.endTime),
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
        users: {
          select: {
            email: true,
          },
        },
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
          firstName: member.firstName,
          lastName: member.lastName,
          name: `${member.firstName} ${member.lastName}`,
          email: member.users?.email || null,
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
    const availability = await prisma.trainerAvailability.findMany({
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

    // Format times to HH:MM strings
    return availability.map(slot => ({
      ...slot,
      startTime: formatTime(slot.startTime),
      endTime: formatTime(slot.endTime),
    }));
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

