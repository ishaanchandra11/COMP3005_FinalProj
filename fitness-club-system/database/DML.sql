-- ============================================
-- Health and Fitness Club Management System
-- Sample Data (DML)
-- ============================================

ALTER TABLE class_schedules
ADD COLUMN IF NOT EXISTS notes TEXT;
TRUNCATE TABLE audit_logs, bill_items, bills, maintenance_logs, class_registrations, 
    class_schedules, personal_training_sessions, trainer_availability, 
    fitness_goals, health_metrics, equipment, group_classes, rooms, 
    admins, trainers, members, users CASCADE;

-- ============================================
-- USERS
-- ============================================

INSERT INTO users (email, password_hash, role, created_at, is_active) VALUES
-- Members
('john.doe@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-01-15 10:00:00', TRUE),
('jane.smith@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-02-01 14:30:00', TRUE),
('mike.johnson@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-02-10 09:15:00', TRUE),
('sarah.williams@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-02-20 11:00:00', TRUE),
('david.brown@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-03-05 16:45:00', TRUE),
('emily.davis@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-03-12 08:30:00', TRUE),
('chris.miller@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-03-18 13:20:00', TRUE),
('lisa.wilson@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-04-01 10:00:00', TRUE),
('robert.moore@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-04-10 15:30:00', TRUE),
('amanda.taylor@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-04-15 09:00:00', TRUE),
('james.anderson@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-05-01 11:15:00', TRUE),
('jennifer.thomas@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-05-05 14:00:00', TRUE),
('william.jackson@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-05-10 10:30:00', TRUE),
('michelle.white@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-05-15 16:00:00', TRUE),
('daniel.harris@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-05-20 08:45:00', TRUE),
('stephanie.martin@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-06-01 12:00:00', TRUE),
('matthew.thompson@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-06-05 09:30:00', TRUE),
('nicole.garcia@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-06-10 15:00:00', TRUE),
('kevin.martinez@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-06-15 11:30:00', TRUE),
('rachel.robinson@email.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'member', '2024-06-20 13:45:00', TRUE),
-- Trainers
('trainer.alex@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'trainer', '2023-12-01 08:00:00', TRUE),
('trainer.maria@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'trainer', '2023-12-15 08:00:00', TRUE),
('trainer.james@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'trainer', '2024-01-01 08:00:00', TRUE),
('trainer.sophia@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'trainer', '2024-01-10 08:00:00', TRUE),
('trainer.michael@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'trainer', '2024-02-01 08:00:00', TRUE),
('trainer.emily@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'trainer', '2024-02-15 08:00:00', TRUE),
-- Admins
('admin.sarah@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'admin', '2023-11-01 08:00:00', TRUE),
('admin.mark@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'admin', '2023-11-15 08:00:00', TRUE),
('admin.lisa@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'admin', '2024-01-01 08:00:00', TRUE),
('admin.david@fitness.com', '$2a$10$Afg2k1pXw2L5rvD2TQYk.OIOVSGeGSjTxmQBkMC0prm/ecHM11g5G', 'admin', '2024-02-01 08:00:00', TRUE);

-- ============================================
-- MEMBERS
-- ============================================

INSERT INTO members (user_id, first_name, last_name, date_of_birth, gender, phone_number, emergency_contact_name, emergency_contact_phone, join_date, membership_status) VALUES
(1, 'John', 'Doe', '1990-05-15', 'M', '613-555-0101', 'Jane Doe', '613-555-0102', '2024-01-15', 'active'),
(2, 'Jane', 'Smith', '1988-08-22', 'F', '613-555-0201', 'John Smith', '613-555-0202', '2024-02-01', 'active'),
(3, 'Mike', 'Johnson', '1992-03-10', 'M', '613-555-0301', 'Sarah Johnson', '613-555-0302', '2024-02-10', 'active'),
(4, 'Sarah', 'Williams', '1995-11-05', 'F', '613-555-0401', 'Tom Williams', '613-555-0402', '2024-02-20', 'active'),
(5, 'David', 'Brown', '1987-07-18', 'M', '613-555-0501', 'Mary Brown', '613-555-0502', '2024-03-05', 'active'),
(6, 'Emily', 'Davis', '1993-09-25', 'F', '613-555-0601', 'Robert Davis', '613-555-0602', '2024-03-12', 'active'),
(7, 'Chris', 'Miller', '1991-12-30', 'M', '613-555-0701', 'Lisa Miller', '613-555-0702', '2024-03-18', 'active'),
(8, 'Lisa', 'Wilson', '1989-04-14', 'F', '613-555-0801', 'Mike Wilson', '613-555-0802', '2024-04-01', 'active'),
(9, 'Robert', 'Moore', '1994-06-20', 'M', '613-555-0901', 'Anna Moore', '613-555-0902', '2024-04-10', 'active'),
(10, 'Amanda', 'Taylor', '1996-01-08', 'F', '613-555-1001', 'David Taylor', '613-555-1002', '2024-04-15', 'active'),
(11, 'James', 'Anderson', '1990-10-12', 'M', '613-555-1101', 'Jennifer Anderson', '613-555-1102', '2024-05-01', 'active'),
(12, 'Jennifer', 'Thomas', '1988-02-28', 'F', '613-555-1201', 'William Thomas', '613-555-1202', '2024-05-05', 'active'),
(13, 'William', 'Jackson', '1992-07-07', 'M', '613-555-1301', 'Michelle Jackson', '613-555-1302', '2024-05-10', 'active'),
(14, 'Michelle', 'White', '1995-03-19', 'F', '613-555-1401', 'Daniel White', '613-555-1402', '2024-05-15', 'active'),
(15, 'Daniel', 'Harris', '1991-09-03', 'M', '613-555-1501', 'Stephanie Harris', '613-555-1502', '2024-05-20', 'active'),
(16, 'Stephanie', 'Martin', '1993-05-16', 'F', '613-555-1601', 'Matthew Martin', '613-555-1602', '2024-06-01', 'active'),
(17, 'Matthew', 'Thompson', '1989-11-22', 'M', '613-555-1701', 'Nicole Thompson', '613-555-1702', '2024-06-05', 'active'),
(18, 'Nicole', 'Garcia', '1994-08-09', 'F', '613-555-1801', 'Kevin Garcia', '613-555-1802', '2024-06-10', 'active'),
(19, 'Kevin', 'Martinez', '1992-12-14', 'M', '613-555-1901', 'Rachel Martinez', '613-555-1902', '2024-06-15', 'active'),
(20, 'Rachel', 'Robinson', '1996-04-26', 'F', '613-555-2001', 'Chris Robinson', '613-555-2002', '2024-06-20', 'active');

-- ============================================
-- TRAINERS
-- ============================================

INSERT INTO trainers (user_id, first_name, last_name, specialization, certification_number, certification_expiry, hire_date, hourly_rate, bio, rating, total_sessions) VALUES
(21, 'Alex', 'Martinez', ARRAY['strength', 'HIIT'], 'CERT-STR-2023-001', '2026-12-31', '2023-12-01', 75.00, 'Certified strength and conditioning specialist with 8 years of experience.', 4.8, 245),
(22, 'Maria', 'Rodriguez', ARRAY['yoga', 'pilates', 'flexibility'], 'CERT-YOG-2023-002', '2026-12-31', '2023-12-15', 65.00, 'Yoga instructor and Pilates expert, helping clients achieve flexibility and mindfulness.', 4.9, 312),
(23, 'James', 'Wilson', ARRAY['cardio', 'endurance'], 'CERT-CAR-2024-001', '2027-12-31', '2024-01-01', 70.00, 'Marathon runner and cardio specialist focused on endurance training.', 4.7, 189),
(24, 'Sophia', 'Chen', ARRAY['HIIT', 'strength', 'cardio'], 'CERT-HIIT-2024-002', '2027-12-31', '2024-01-10', 80.00, 'High-intensity interval training expert with a passion for transformation.', 4.9, 278),
(25, 'Michael', 'Thompson', ARRAY['strength', 'bodybuilding'], 'CERT-BB-2024-003', '2027-12-31', '2024-02-01', 85.00, 'Bodybuilding coach and powerlifting specialist.', 4.6, 156),
(26, 'Emily', 'Johnson', ARRAY['dance', 'cardio', 'zumba'], 'CERT-DAN-2024-004', '2027-12-31', '2024-02-15', 60.00, 'Dance fitness instructor bringing energy and fun to every class.', 4.8, 201);

-- ============================================
-- ADMINS
-- ============================================

INSERT INTO admins (user_id, first_name, last_name, department, hire_date) VALUES
(27, 'Sarah', 'Anderson', 'operations', '2023-11-01'),
(28, 'Mark', 'Davis', 'maintenance', '2023-11-15'),
(29, 'Lisa', 'Brown', 'billing', '2024-01-01'),
(30, 'David', 'Miller', 'operations', '2024-02-01');

-- ============================================
-- ROOMS
-- ============================================

INSERT INTO rooms (room_name, room_type, capacity, has_equipment, is_active, description) VALUES
('Main Gym Floor', 'gym_floor', 50, TRUE, TRUE, 'Large open space with cardio and strength equipment'),
('Yoga Studio A', 'studio', 25, FALSE, TRUE, 'Peaceful studio with mirrors and mats'),
('Yoga Studio B', 'studio', 20, FALSE, TRUE, 'Smaller studio for intimate classes'),
('Spin Room', 'studio', 30, TRUE, TRUE, 'Dedicated cycling studio with 30 bikes'),
('HIIT Studio', 'studio', 20, TRUE, TRUE, 'High-intensity training space with equipment'),
('Pool Area', 'pool', 40, FALSE, TRUE, 'Olympic-sized pool for aquatic fitness'),
('Basketball Court', 'court', 24, FALSE, TRUE, 'Full-size basketball court');

-- ============================================
-- EQUIPMENT
-- ============================================

INSERT INTO equipment (room_id, equipment_name, equipment_type, brand, model, purchase_date, last_maintenance_date, next_maintenance_due, status, serial_number) VALUES
(1, 'Treadmill 01', 'cardio', 'Life Fitness', 'T5', '2023-01-15', '2024-10-01', '2025-01-01', 'operational', 'LF-T5-001'),
(1, 'Treadmill 02', 'cardio', 'Life Fitness', 'T5', '2023-01-15', '2024-09-15', '2024-12-15', 'operational', 'LF-T5-002'),
(1, 'Elliptical 01', 'cardio', 'Precor', 'EFX 885', '2023-02-01', '2024-10-05', '2025-01-05', 'operational', 'PR-EFX-001'),
(1, 'Rowing Machine', 'cardio', 'Concept2', 'Model D', '2023-02-10', '2024-09-20', '2024-12-20', 'operational', 'C2-MD-001'),
(1, 'Leg Press Machine', 'strength', 'Cybex', 'VR3', '2023-03-01', '2024-08-15', '2024-11-15', 'operational', 'CY-VR3-001'),
(1, 'Chest Press Machine', 'strength', 'Hammer Strength', 'ISO-Lateral', '2023-03-01', '2024-09-01', '2024-12-01', 'operational', 'HS-ISO-001'),
(1, 'Smith Machine', 'machine', 'Life Fitness', 'Smith', '2023-03-15', '2024-08-20', '2024-11-20', 'operational', 'LF-SM-001'),
(1, 'Dumbbell Set', 'free_weights', 'Rogue', 'Rubber Hex', '2023-04-01', '2024-10-01', '2025-01-01', 'operational', 'RG-RH-001'),
(4, 'Spin Bike 01', 'cardio', 'Keiser', 'M3i', '2023-05-01', '2024-09-10', '2024-12-10', 'operational', 'KS-M3i-001'),
(4, 'Spin Bike 02', 'cardio', 'Keiser', 'M3i', '2023-05-01', '2024-09-10', '2024-12-10', 'operational', 'KS-M3i-002'),
(4, 'Spin Bike 03', 'cardio', 'Keiser', 'M3i', '2023-05-01', '2024-09-10', '2024-12-10', 'needs_maintenance', 'KS-M3i-003'),
(5, 'Battle Ropes', 'strength', 'Rogue', 'Manila', '2023-06-01', '2024-08-01', '2024-11-01', 'operational', 'RG-MAN-001'),
(5, 'Kettlebells Set', 'free_weights', 'Rogue', 'E-coat', '2023-06-01', '2024-08-01', '2024-11-01', 'operational', 'RG-EC-001'),
(1, 'Bench Press', 'machine', 'Rogue', 'Monster', '2023-07-01', '2024-09-15', '2024-12-15', 'under_repair', 'RG-MON-001');

-- ============================================
-- GROUP CLASSES
-- ============================================

INSERT INTO group_classes (class_name, class_type, description, difficulty_level, duration_minutes, max_capacity, requires_equipment, is_active) VALUES
('Morning Yoga Flow', 'yoga', 'Gentle yoga flow to start your day', 'beginner', 60, 25, FALSE, TRUE),
('Power Yoga', 'yoga', 'Intense yoga session for strength and flexibility', 'advanced', 75, 20, FALSE, TRUE),
('Pilates Core', 'pilates', 'Focus on core strength and stability', 'intermediate', 45, 20, FALSE, TRUE),
('Spin Class', 'spin', 'High-energy cycling workout', 'intermediate', 45, 30, TRUE, TRUE),
('HIIT Blast', 'HIIT', 'High-intensity interval training', 'advanced', 30, 20, TRUE, TRUE),
('Zumba Dance Party', 'zumba', 'Fun dance fitness class', 'beginner', 60, 25, FALSE, TRUE),
('Strength Training', 'strength', 'Full-body strength workout', 'intermediate', 60, 20, TRUE, TRUE),
('Cardio Kickboxing', 'cardio', 'Cardio workout with kickboxing moves', 'intermediate', 45, 25, FALSE, TRUE);

-- ============================================
-- FITNESS GOALS
-- ============================================

INSERT INTO fitness_goals (member_id, goal_type, target_value, target_date, current_value, status, created_at, notes) VALUES
(1, 'weight_loss', 75.0, '2025-06-01', 82.5, 'active', '2024-01-20 10:00:00', 'Lose 7.5kg by summer'),
(1, 'muscle_gain', 85.0, '2025-12-31', 82.5, 'active', '2024-02-01 10:00:00', 'Build muscle mass'),
(2, 'weight_loss', 60.0, '2025-03-01', 68.0, 'active', '2024-02-05 14:00:00', 'Reach target weight'),
(3, 'endurance', 10.0, '2025-05-01', 5.5, 'active', '2024-02-15 09:00:00', 'Run 10km without stopping'),
(4, 'flexibility', 180.0, '2025-08-01', 120.0, 'active', '2024-03-01 11:00:00', 'Touch toes and improve flexibility'),
(5, 'muscle_gain', 90.0, '2025-12-31', 85.0, 'active', '2024-03-10 15:00:00', 'Build strength and muscle'),
(6, 'weight_loss', 55.0, '2025-04-01', 62.0, 'active', '2024-03-15 10:00:00', 'Weight loss goal'),
(7, 'general_fitness', 1.0, '2025-12-31', NULL, 'active', '2024-03-20 13:00:00', 'Maintain overall fitness'),
(8, 'weight_loss', 58.0, '2025-06-01', 65.0, 'active', '2024-04-05 09:00:00', 'Summer body goal'),
(9, 'muscle_gain', 80.0, '2025-10-01', 75.0, 'active', '2024-04-15 11:00:00', 'Build muscle'),
(10, 'flexibility', 160.0, '2025-07-01', 140.0, 'active', '2024-04-20 14:00:00', 'Improve flexibility'),
(11, 'endurance', 21.0, '2025-09-01', 10.0, 'active', '2024-05-05 10:00:00', 'Complete half marathon'),
(12, 'weight_loss', 63.0, '2025-05-01', 70.0, 'active', '2024-05-10 15:00:00', 'Weight loss journey'),
(1, 'endurance', 5.0, '2024-12-31', 5.0, 'achieved', '2024-01-25 10:00:00', 'Run 5km - ACHIEVED!');

-- ============================================
-- HEALTH METRICS
-- ============================================
INSERT INTO health_metrics (member_id, recorded_at, weight, height, body_fat_percentage, muscle_mass, resting_heart_rate, blood_pressure_systolic, blood_pressure_diastolic, notes) VALUES
(1, '2024-01-20 10:00:00', 85.0, 178, 22.5, 65.0, 72, 120, 80, 'Initial assessment'),
(1, '2024-02-15 10:00:00', 83.5, 178, 21.8, 65.5, 70, 118, 78, 'Good progress'),
(1, '2024-03-15 10:00:00', 82.5, 178, 21.0, 66.0, 68, 118, 78, 'Continuing to improve'),
(1, '2024-04-15 10:00:00', 81.0, 178, 20.2, 66.5, 67, 115, 75, 'Excellent progress'),
(1, '2024-05-15 10:00:00', 80.0, 178, 19.5, 67.0, 65, 115, 75, 'Great results'),
(1, '2024-06-15 10:00:00', 79.0, 178, 19.0, 67.5, 64, 114, 74, 'Almost at goal'),
(1, '2024-07-15 10:00:00', 78.5, 178, 18.8, 68.0, 63, 114, 74, 'Maintaining progress'),
(1, '2024-08-15 10:00:00', 78.0, 178, 18.5, 68.2, 62, 113, 73, 'Steady improvement'),
(1, '2024-09-15 10:00:00', 77.5, 178, 18.2, 68.5, 62, 112, 72, 'On track'),
(1, '2024-10-15 10:00:00', 77.0, 178, 18.0, 68.8, 61, 112, 72, 'Latest measurement');
INSERT INTO health_metrics (member_id, recorded_at, weight, height, body_fat_percentage, muscle_mass, resting_heart_rate, blood_pressure_systolic, blood_pressure_diastolic, notes) VALUES
(2, '2024-02-05 14:00:00', 70.0, 165, 28.0, 48.0, 75, 125, 82, 'Initial assessment'),
(2, '2024-03-05 14:00:00', 69.0, 165, 27.2, 48.5, 74, 124, 81, 'Progress update'),
(2, '2024-04-05 14:00:00', 68.5, 165, 26.8, 49.0, 73, 122, 80, 'Good progress'),
(2, '2024-05-05 14:00:00', 68.0, 165, 26.5, 49.2, 72, 122, 80, 'Continuing improvement'),
(2, '2024-06-05 14:00:00', 67.5, 165, 26.0, 49.5, 71, 120, 78, 'Latest measurement');
INSERT INTO health_metrics (member_id, recorded_at, weight, height, body_fat_percentage, muscle_mass, resting_heart_rate, blood_pressure_systolic, blood_pressure_diastolic, notes) VALUES
(3, '2024-02-15 09:00:00', 80.0, 180, 20.0, 62.0, 70, 118, 76, 'Initial assessment'),
(3, '2024-04-15 09:00:00', 79.5, 180, 19.8, 62.5, 69, 117, 75, 'Progress update'),
(3, '2024-06-15 09:00:00', 79.0, 180, 19.5, 63.0, 68, 116, 74, 'Latest measurement');
INSERT INTO health_metrics (member_id, recorded_at, weight, height, body_fat_percentage, muscle_mass, resting_heart_rate, blood_pressure_systolic, blood_pressure_diastolic) VALUES
(4, '2024-10-01 11:00:00', 65.0, 170, 25.0, 47.0, 72, 120, 78),
(5, '2024-10-05 15:00:00', 87.0, 185, 18.0, 70.0, 65, 115, 73),
(6, '2024-10-10 08:00:00', 62.5, 160, 24.5, 46.0, 74, 122, 80),
(7, '2024-10-12 13:00:00', 75.0, 175, 20.0, 58.0, 70, 118, 76),
(8, '2024-10-15 09:00:00', 66.0, 168, 26.0, 47.5, 73, 121, 79),
(9, '2024-10-18 11:00:00', 76.0, 182, 19.0, 60.0, 68, 116, 74),
(10, '2024-10-20 14:00:00', 58.0, 155, 22.0, 44.0, 76, 124, 81);

-- ============================================
-- TRAINER AVAILABILITY
-- ============================================
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, effective_date) VALUES
(1, 'MON', '06:00', '14:00', TRUE, '2024-01-01'),
(1, 'WED', '06:00', '14:00', TRUE, '2024-01-01'),
(1, 'FRI', '06:00', '14:00', TRUE, '2024-01-01'),
(1, 'TUE', '16:00', '20:00', TRUE, '2024-01-01'),
(1, 'THU', '16:00', '20:00', TRUE, '2024-01-01');
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, effective_date) VALUES
(2, 'MON', '08:00', '12:00', TRUE, '2024-01-01'),
(2, 'WED', '08:00', '12:00', TRUE, '2024-01-01'),
(2, 'FRI', '08:00', '12:00', TRUE, '2024-01-01'),
(2, 'TUE', '14:00', '18:00', TRUE, '2024-01-01'),
(2, 'THU', '14:00', '18:00', TRUE, '2024-01-01'),
(2, 'SAT', '09:00', '13:00', TRUE, '2024-01-01');
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, effective_date) VALUES
(3, 'MON', '05:00', '13:00', TRUE, '2024-01-01'),
(3, 'WED', '05:00', '13:00', TRUE, '2024-01-01'),
(3, 'FRI', '05:00', '13:00', TRUE, '2024-01-01'),
(3, 'SAT', '07:00', '11:00', TRUE, '2024-01-01');
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, effective_date) VALUES
(4, 'TUE', '06:00', '14:00', TRUE, '2024-01-01'),
(4, 'THU', '06:00', '14:00', TRUE, '2024-01-01'),
(4, 'SAT', '08:00', '16:00', TRUE, '2024-01-01'),
(4, 'SUN', '10:00', '14:00', TRUE, '2024-01-01');
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, effective_date) VALUES
(5, 'MON', '14:00', '22:00', TRUE, '2024-02-01'),
(5, 'WED', '14:00', '22:00', TRUE, '2024-02-01'),
(5, 'FRI', '14:00', '22:00', TRUE, '2024-02-01'),
(5, 'SAT', '10:00', '18:00', TRUE, '2024-02-01');
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, effective_date) VALUES
(6, 'TUE', '09:00', '17:00', TRUE, '2024-02-15'),
(6, 'THU', '09:00', '17:00', TRUE, '2024-02-15'),
(6, 'SAT', '12:00', '16:00', TRUE, '2024-02-15'),
(6, 'SUN', '12:00', '16:00', TRUE, '2024-02-15');

-- ============================================
-- CLASS SCHEDULES
-- ============================================
INSERT INTO class_schedules (class_id, trainer_id, room_id, scheduled_date, start_time, end_time, current_capacity, status)
VALUES
(1, 2, 2, CURRENT_DATE + 1, '08:00:00', '09:00:00', 5, 'scheduled'),
(4, 3, 4, CURRENT_DATE + 1, '06:00:00', '06:45:00', 10, 'scheduled'),
(5, 4, 5, CURRENT_DATE + 1, '07:00:00', '07:30:00', 3, 'scheduled')
ON CONFLICT (room_id, scheduled_date, start_time, end_time) DO NOTHING;
INSERT INTO class_schedules (class_id, trainer_id, room_id, scheduled_date, start_time, end_time, current_capacity, status)
VALUES
(3, 2, 3, CURRENT_DATE + 2, '10:00:00', '10:45:00', 2, 'scheduled'),
(6, 6, 2, CURRENT_DATE + 2, '18:00:00', '19:00:00', 10, 'scheduled'),
(8, 3, 5, CURRENT_DATE + 2, '19:00:00', '19:45:00', 8, 'scheduled')
ON CONFLICT (room_id, scheduled_date, start_time, end_time) DO NOTHING;
INSERT INTO class_schedules (class_id, trainer_id, room_id, scheduled_date, start_time, end_time, current_capacity, status)
VALUES
(2, 2, 2, CURRENT_DATE + 3, '08:00:00', '09:15:00', 5, 'scheduled'),
(4, 3, 4, CURRENT_DATE + 3, '06:00:00', '06:45:00', 12, 'scheduled'),
(7, 1, 1, CURRENT_DATE + 3, '17:00:00', '18:00:00', 8, 'scheduled')
ON CONFLICT (room_id, scheduled_date, start_time, end_time) DO NOTHING;
INSERT INTO class_schedules (class_id, trainer_id, room_id, scheduled_date, start_time, end_time, current_capacity, status)
VALUES
(3, 2, 3, CURRENT_DATE + 4, '10:00:00', '10:45:00', 4, 'scheduled'),
(6, 6, 2, CURRENT_DATE + 4, '18:00:00', '19:00:00', 15, 'scheduled')
ON CONFLICT (room_id, scheduled_date, start_time, end_time) DO NOTHING;
INSERT INTO class_schedules (class_id, trainer_id, room_id, scheduled_date, start_time, end_time, current_capacity, status)
VALUES
(1, 2, 2, CURRENT_DATE + 5, '08:00:00', '09:00:00', 7, 'scheduled'),
(4, 3, 4, CURRENT_DATE + 5, '06:00:00', '06:45:00', 20, 'scheduled'),
(5, 4, 5, CURRENT_DATE + 5, '07:00:00', '07:30:00', 5, 'scheduled')
ON CONFLICT (room_id, scheduled_date, start_time, end_time) DO NOTHING;
INSERT INTO class_schedules (class_id, trainer_id, room_id, scheduled_date, start_time, end_time, current_capacity, status)
VALUES
(6, 6, 2, CURRENT_DATE + 6, '14:00:00', '15:00:00', 10, 'scheduled'),
(7, 5, 1, CURRENT_DATE + 6, '11:00:00', '12:00:00', 6, 'scheduled')
ON CONFLICT (room_id, scheduled_date, start_time, end_time) DO NOTHING;
INSERT INTO class_schedules (class_id, trainer_id, room_id, scheduled_date, start_time, end_time, current_capacity, status)
VALUES
(1, 2, 2, CURRENT_DATE + 7, '10:00:00', '11:00:00', 8, 'scheduled'),
(5, 4, 5, CURRENT_DATE + 7, '11:00:00', '11:30:00', 6, 'scheduled')
ON CONFLICT (room_id, scheduled_date, start_time, end_time) DO NOTHING;
INSERT INTO class_schedules (class_id, trainer_id, room_id, scheduled_date, start_time, end_time, current_capacity, status)
VALUES
(1, 2, 2, CURRENT_DATE + 8, '08:00:00', '09:00:00', 0, 'scheduled'),
(3, 2, 3, CURRENT_DATE + 9, '10:00:00', '10:45:00', 5, 'scheduled'),
(7, 1, 1, CURRENT_DATE + 10, '17:00:00', '18:00:00', 10, 'scheduled'),
(4, 3, 4, CURRENT_DATE + 11, '06:00:00', '06:45:00', 15, 'scheduled'),
(6, 6, 2, CURRENT_DATE + 12, '18:00:00', '19:00:00', 12, 'scheduled'),
(2, 2, 2, CURRENT_DATE + 13, '08:00:00', '09:15:00', 3, 'scheduled'),
(8, 3, 5, CURRENT_DATE + 14, '19:00:00', '19:45:00', 10, 'scheduled')
ON CONFLICT (room_id, scheduled_date, start_time, end_time) DO NOTHING;

-- ============================================
-- PERSONAL TRAINING SESSIONS
-- ============================================
INSERT INTO personal_training_sessions (member_id, trainer_id, room_id, scheduled_date, start_time, end_time, status, created_at) VALUES
(1, 1, 1, CURRENT_DATE + INTERVAL '2 days', '11:00', '12:00', 'scheduled', '2024-10-20 10:00:00'),
(2, 2, 2, CURRENT_DATE + INTERVAL '3 days', '11:00', '12:00', 'scheduled', '2024-10-18 14:00:00'),
(3, 3, 1, CURRENT_DATE + INTERVAL '4 days', '08:00', '09:00', 'scheduled', '2024-10-19 09:00:00'),
(4, 4, 5, CURRENT_DATE + INTERVAL '5 days', '08:00', '08:30', 'scheduled', '2024-10-20 11:00:00'),
(5, 5, 1, CURRENT_DATE + INTERVAL '6 days', '15:00', '16:00', 'scheduled', '2024-10-19 15:00:00'),
(6, 1, 1, CURRENT_DATE + INTERVAL '7 days', '12:00', '13:00', 'scheduled', '2024-10-21 08:00:00'),
(7, 2, 2, CURRENT_DATE + INTERVAL '8 days', '10:00', '11:00', 'scheduled', '2024-10-20 13:00:00'),
(8, 3, 1, CURRENT_DATE + INTERVAL '9 days', '09:00', '10:00', 'scheduled', '2024-10-21 10:00:00');
INSERT INTO personal_training_sessions (member_id, trainer_id, room_id, scheduled_date, start_time, end_time, status, trainer_notes, created_at) VALUES
(1, 1, 1, CURRENT_DATE - INTERVAL '7 days', '11:00', '12:00', 'completed', 'Great session, focused on upper body strength', '2024-10-10 10:00:00'),
(1, 1, 1, CURRENT_DATE - INTERVAL '14 days', '11:00', '12:00', 'completed', 'Leg day, excellent form', '2024-10-03 10:00:00'),
(2, 2, 2, CURRENT_DATE - INTERVAL '5 days', '11:00', '12:00', 'completed', 'Yoga flow session, improved flexibility', '2024-10-12 14:00:00'),
(3, 3, 1, CURRENT_DATE - INTERVAL '10 days', '08:00', '09:00', 'completed', 'Cardio endurance training', '2024-10-07 09:00:00'),
(4, 4, 5, CURRENT_DATE - INTERVAL '3 days', '08:00', '08:30', 'completed', 'HIIT workout, high intensity', '2024-10-14 11:00:00');

-- ============================================
-- CLASS REGISTRATIONS
-- ============================================

INSERT INTO class_registrations (member_id, schedule_id, registration_date, attendance_status, waitlist_position) VALUES
(1, 1, '2024-10-20 10:00:00', 'registered', NULL),
(2, 1, '2024-10-19 14:00:00', 'registered', NULL),
(3, 1, '2024-10-18 09:00:00', 'registered', NULL),
(4, 4, '2024-10-20 11:00:00', 'registered', NULL),
(5, 4, '2024-10-19 15:00:00', 'registered', NULL),
(6, 5, '2024-10-21 08:00:00', 'registered', NULL),
(7, 5, '2024-10-20 13:00:00', 'registered', NULL),
(8, 7, '2024-10-19 10:00:00', 'registered', NULL),
(9, 8, '2024-10-20 09:00:00', 'registered', NULL),
(10, 8, '2024-10-19 11:00:00', 'registered', NULL),
(11, 9, '2024-10-21 10:00:00', 'registered', NULL),
(12, 9, '2024-10-20 14:00:00', 'registered', NULL),
(13, 10, '2024-10-19 16:00:00', 'registered', NULL),
(14, 11, '2024-10-20 08:00:00', 'registered', NULL),
(15, 12, '2024-10-21 09:00:00', 'registered', NULL),
(16, 13, '2024-10-20 10:00:00', 'registered', NULL),
(17, 18, '2024-10-19 08:00:00', 'registered', NULL),
(18, 18, '2024-10-19 09:00:00', 'registered', NULL),
(19, 18, '2024-10-19 10:00:00', 'registered', 1),
(20, 18, '2024-10-19 11:00:00', 'registered', 2);
UPDATE class_registrations SET attendance_status = 'attended', checked_in_at = CURRENT_TIMESTAMP - INTERVAL '2 days' WHERE registration_id IN (1, 2, 4, 5);

-- ============================================
-- BILLS AND PAYMENTS
-- ============================================
INSERT INTO bills (member_id, generated_date, due_date, subtotal, status, payment_method, paid_at, notes) VALUES
(1, '2024-10-01', '2024-10-15', 99.99, 'paid', 'credit_card', '2024-10-05 10:00:00', 'Monthly membership'),
(2, '2024-10-01', '2024-10-15', 99.99, 'paid', 'debit', '2024-10-03 14:00:00', 'Monthly membership'),
(3, '2024-10-01', '2024-10-15', 99.99, 'paid', 'e_transfer', '2024-10-07 09:00:00', 'Monthly membership'),
(4, '2024-10-01', '2024-10-15', 99.99, 'paid', 'credit_card', '2024-10-04 11:00:00', 'Monthly membership'),
(5, '2024-10-01', '2024-10-15', 99.99, 'paid', 'credit_card', '2024-10-06 15:00:00', 'Monthly membership'),
(6, '2024-10-01', '2024-10-15', 99.99, 'pending', NULL, NULL, 'Monthly membership'),
(7, '2024-10-01', '2024-10-15', 99.99, 'paid', 'debit', '2024-10-08 13:00:00', 'Monthly membership'),
(8, '2024-10-01', '2024-10-15', 99.99, 'overdue', NULL, NULL, 'Monthly membership'),
(9, '2024-10-01', '2024-10-15', 99.99, 'paid', 'credit_card', '2024-10-02 10:00:00', 'Monthly membership'),
(10, '2024-10-01', '2024-10-15', 99.99, 'paid', 'e_transfer', '2024-10-09 16:00:00', 'Monthly membership');
INSERT INTO bills (member_id, generated_date, due_date, subtotal, status, payment_method, paid_at) VALUES
(1, '2024-10-15', '2024-10-29', 75.00, 'paid', 'credit_card', '2024-10-16 10:00:00'),
(2, '2024-10-12', '2024-10-26', 65.00, 'paid', 'debit', '2024-10-13 14:00:00'),
(3, '2024-10-07', '2024-10-21', 70.00, 'paid', 'credit_card', '2024-10-08 09:00:00'),
(4, '2024-10-14', '2024-10-28', 80.00, 'pending', NULL, NULL),
(5, '2024-10-19', '2024-11-02', 85.00, 'pending', NULL, NULL);

INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, related_session_id, related_class_id) VALUES
(1, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(2, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(3, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(4, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(5, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(6, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(7, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(8, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(9, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(10, 'membership', 'Monthly Gym Membership - October 2024', 1, 99.99, NULL, NULL),
(11, 'personal_training', 'Personal Training Session with Alex Martinez', 1, 75.00, 1, NULL),
(12, 'personal_training', 'Personal Training Session with Maria Rodriguez', 1, 65.00, 2, NULL),
(13, 'personal_training', 'Personal Training Session with James Wilson', 1, 70.00, 3, NULL),
(14, 'personal_training', 'Personal Training Session with Sophia Chen', 1, 80.00, 4, NULL),
(15, 'personal_training', 'Personal Training Session with Michael Thompson', 1, 85.00, 5, NULL);

-- ============================================
-- MAINTENANCE LOGS
-- ============================================

INSERT INTO maintenance_logs (equipment_id, reported_by, assigned_to, issue_description, priority, status, reported_date, resolved_date, resolution_notes, cost) VALUES
(11, 1, 2, 'Bike making unusual noise during high resistance', 'medium', 'reported', '2024-10-20 14:00:00', NULL, NULL, NULL),
(14, 27, 2, 'Bench press bar is loose and needs tightening', 'high', 'in_progress', '2024-10-18 10:00:00', NULL, 'Inspecting hardware', NULL),
(3, 2, 2, 'Elliptical screen flickering', 'low', 'resolved', '2024-10-15 09:00:00', '2024-10-16 15:00:00', 'Replaced display cable', 45.00),
(1, 27, 2, 'Treadmill belt needs lubrication', 'low', 'resolved', '2024-10-10 08:00:00', '2024-10-10 12:00:00', 'Applied lubricant, running smoothly', 25.00),
(5, 1, 2, 'Leg press machine seat adjustment not working', 'medium', 'resolved', '2024-10-05 11:00:00', '2024-10-07 14:00:00', 'Replaced adjustment mechanism', 150.00);

