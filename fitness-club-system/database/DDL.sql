-- ============================================
-- Health and Fitness Club Management System
-- Database Schema (DDL)
-- ============================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ============================================
-- ENUM Types
-- ============================================

CREATE TYPE user_role AS ENUM ('member', 'trainer', 'admin');
CREATE TYPE gender_type AS ENUM ('M', 'F', 'Other');
CREATE TYPE membership_status AS ENUM ('active', 'frozen', 'cancelled');
CREATE TYPE goal_status AS ENUM ('active', 'achieved', 'paused', 'cancelled');
CREATE TYPE goal_type AS ENUM ('weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness');
CREATE TYPE room_type AS ENUM ('gym_floor', 'studio', 'pool', 'court');
CREATE TYPE equipment_type AS ENUM ('cardio', 'strength', 'free_weights', 'machine');
CREATE TYPE equipment_status AS ENUM ('operational', 'needs_maintenance', 'under_repair', 'out_of_service');
CREATE TYPE class_type AS ENUM ('yoga', 'pilates', 'spin', 'zumba', 'HIIT', 'strength', 'cardio', 'dance');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE schedule_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE attendance_status AS ENUM ('registered', 'attended', 'no_show', 'cancelled');
CREATE TYPE bill_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit', 'cash', 'e_transfer');
CREATE TYPE bill_item_type AS ENUM ('membership', 'personal_training', 'class', 'product', 'other');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE maintenance_status AS ENUM ('reported', 'in_progress', 'resolved', 'cancelled');
CREATE TYPE day_of_week AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');
CREATE TYPE admin_department AS ENUM ('operations', 'maintenance', 'billing');

-- ============================================
-- Core Tables
-- ============================================

-- Users table (base authentication)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Members table
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    phone_number VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    join_date DATE DEFAULT CURRENT_DATE,
    membership_status membership_status DEFAULT 'active',
    membership_end_date DATE,
    CONSTRAINT valid_age CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '16 years'),
    CONSTRAINT valid_phone CHECK (phone_number IS NULL OR phone_number ~ '^[0-9+\-() ]+$')
);

-- Trainers table
CREATE TABLE trainers (
    trainer_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization TEXT[], -- Array of specializations
    certification_number VARCHAR(50),
    certification_expiry DATE,
    hire_date DATE DEFAULT CURRENT_DATE,
    hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
    bio TEXT,
    profile_image_url VARCHAR(500),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_sessions INTEGER DEFAULT 0,
    CONSTRAINT valid_rate CHECK (hourly_rate >= 0),
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Admins table
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department admin_department NOT NULL,
    hire_date DATE DEFAULT CURRENT_DATE
);

-- Fitness Goals table
CREATE TABLE fitness_goals (
    goal_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    goal_type goal_type NOT NULL,
    target_value DECIMAL(10, 2) NOT NULL,
    target_date DATE NOT NULL,
    current_value DECIMAL(10, 2),
    status goal_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    achieved_at TIMESTAMP,
    notes TEXT,
    CONSTRAINT valid_target_date CHECK (target_date >= COALESCE(created_at::DATE, CURRENT_DATE)),
    CONSTRAINT valid_values CHECK (target_value > 0 AND (current_value IS NULL OR current_value >= 0))
);

-- Health Metrics table (historical tracking)
CREATE TABLE health_metrics (
    metric_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    weight DECIMAL(5, 2), -- in kg
    height DECIMAL(5, 2), -- in cm
    body_fat_percentage DECIMAL(5, 2),
    muscle_mass DECIMAL(5, 2), -- in kg
    resting_heart_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    notes TEXT,
    CONSTRAINT valid_weight CHECK (weight IS NULL OR weight > 0 AND weight < 500),
    CONSTRAINT valid_height CHECK (height IS NULL OR height > 0 AND height < 300),
    CONSTRAINT valid_body_fat CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 0 AND body_fat_percentage <= 100)),
    CONSTRAINT valid_heart_rate CHECK (resting_heart_rate IS NULL OR (resting_heart_rate >= 30 AND resting_heart_rate <= 200)),
    CONSTRAINT valid_bp CHECK (
        (blood_pressure_systolic IS NULL AND blood_pressure_diastolic IS NULL) OR
        (blood_pressure_systolic > 0 AND blood_pressure_diastolic > 0 AND blood_pressure_systolic > blood_pressure_diastolic)
    )
);

ALTER TABLE health_metrics 
ADD COLUMN bmi DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
        WHEN weight IS NOT NULL AND height IS NOT NULL AND height > 0 
        THEN ROUND((weight / POWER(height / 100, 2))::numeric, 2)
        ELSE NULL
    END
) STORED;

-- Rooms table
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL UNIQUE,
    room_type room_type NOT NULL,
    capacity INTEGER NOT NULL,
    has_equipment BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    CONSTRAINT valid_capacity CHECK (capacity > 0)
);

-- Equipment table
CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(room_id) ON DELETE SET NULL,
    equipment_name VARCHAR(100) NOT NULL,
    equipment_type equipment_type NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    purchase_date DATE,
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    status equipment_status DEFAULT 'operational',
    serial_number VARCHAR(100),
    CONSTRAINT valid_dates CHECK (
        (last_maintenance_date IS NULL OR purchase_date IS NULL OR last_maintenance_date >= purchase_date) AND
        (next_maintenance_due IS NULL OR last_maintenance_date IS NULL OR next_maintenance_due >= last_maintenance_date)
    )
);

-- Group Classes table
CREATE TABLE group_classes (
    class_id SERIAL PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    class_type class_type NOT NULL,
    description TEXT,
    difficulty_level difficulty_level NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL,
    requires_equipment BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT valid_duration CHECK (duration_minutes > 0),
    CONSTRAINT valid_class_capacity CHECK (max_capacity > 0)
);

-- Class Schedule table
CREATE TABLE class_schedules (
    schedule_id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES group_classes(class_id) ON DELETE CASCADE,
    trainer_id INTEGER NOT NULL REFERENCES trainers(trainer_id) ON DELETE RESTRICT,
    room_id INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    current_capacity INTEGER DEFAULT 0,
    status schedule_status DEFAULT 'scheduled',
    cancellation_reason TEXT,
    notes TEXT,
    CONSTRAINT valid_time CHECK (end_time > start_time),
    CONSTRAINT valid_capacity CHECK (current_capacity >= 0),
    CONSTRAINT no_room_conflict UNIQUE (room_id, scheduled_date, start_time, end_time),
    CONSTRAINT no_trainer_conflict UNIQUE (trainer_id, scheduled_date, start_time, end_time)
);

-- Personal Training Sessions table
CREATE TABLE personal_training_sessions (
    session_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    trainer_id INTEGER NOT NULL REFERENCES trainers(trainer_id) ON DELETE RESTRICT,
    room_id INTEGER REFERENCES rooms(room_id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status session_status DEFAULT 'scheduled',
    notes TEXT,
    member_feedback TEXT,
    trainer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    CONSTRAINT valid_session_time CHECK (end_time > start_time),
    CONSTRAINT no_member_conflict UNIQUE (member_id, scheduled_date, start_time, end_time),
    CONSTRAINT no_pt_trainer_conflict UNIQUE (trainer_id, scheduled_date, start_time, end_time)
);

-- Class Registrations table
CREATE TABLE class_registrations (
    registration_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    schedule_id INTEGER NOT NULL REFERENCES class_schedules(schedule_id) ON DELETE CASCADE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status attendance_status DEFAULT 'registered',
    waitlist_position INTEGER,
    checked_in_at TIMESTAMP,
    CONSTRAINT valid_waitlist CHECK (waitlist_position IS NULL OR waitlist_position > 0),
    CONSTRAINT unique_registration UNIQUE (member_id, schedule_id)
);

-- Trainer Availability table
CREATE TABLE trainer_availability (
    availability_id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES trainers(trainer_id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    effective_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    CONSTRAINT valid_availability_time CHECK (end_time > start_time),
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= effective_date)
);

-- Bills table
CREATE TABLE bills (
    bill_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    generated_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 4) DEFAULT 0.13, -- HST 13%
    tax_amount DECIMAL(10, 2) GENERATED ALWAYS AS (ROUND((subtotal * tax_rate)::numeric, 2)) STORED,
    total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (ROUND((subtotal * (1 + tax_rate))::numeric, 2)) STORED,
    status bill_status DEFAULT 'pending',
    payment_method payment_method,
    paid_at TIMESTAMP,
    notes TEXT,
    CONSTRAINT valid_due_date CHECK (due_date >= generated_date),
    CONSTRAINT valid_amounts CHECK (subtotal >= 0)
);

-- Bill Items table
CREATE TABLE bill_items (
    item_id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES bills(bill_id) ON DELETE CASCADE,
    item_type bill_item_type NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (ROUND((quantity * unit_price)::numeric, 2)) STORED,
    related_session_id INTEGER REFERENCES personal_training_sessions(session_id) ON DELETE SET NULL,
    related_class_id INTEGER REFERENCES class_schedules(schedule_id) ON DELETE SET NULL,
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_price CHECK (unit_price >= 0)
);

-- Maintenance Logs table
CREATE TABLE maintenance_logs (
    log_id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
    reported_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    assigned_to INTEGER REFERENCES admins(admin_id) ON DELETE SET NULL,
    issue_description TEXT NOT NULL,
    priority maintenance_priority DEFAULT 'medium',
    status maintenance_status DEFAULT 'reported',
    reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_date TIMESTAMP,
    resolution_notes TEXT,
    cost DECIMAL(10, 2),
    CONSTRAINT valid_resolution_date CHECK (resolved_date IS NULL OR resolved_date >= reported_date),
    CONSTRAINT valid_cost CHECK (cost IS NULL OR cost >= 0)
);

-- Audit Log table (bonus for tracking changes)
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES users(user_id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Member indexes
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_status ON members(membership_status);
CREATE INDEX idx_members_name ON members(last_name, first_name);
CREATE INDEX idx_trainers_user_id ON trainers(user_id);
CREATE INDEX idx_trainers_rating ON trainers(rating DESC);
CREATE INDEX idx_health_metrics_member ON health_metrics(member_id, recorded_at DESC);
CREATE INDEX idx_health_metrics_date ON health_metrics(recorded_at DESC);
CREATE INDEX idx_fitness_goals_member ON fitness_goals(member_id, status);
CREATE INDEX idx_fitness_goals_status ON fitness_goals(status);
CREATE INDEX idx_equipment_room ON equipment(room_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_class_schedules_date ON class_schedules(scheduled_date, start_time);
CREATE INDEX idx_class_schedules_trainer ON class_schedules(trainer_id, scheduled_date);
CREATE INDEX idx_class_schedules_room ON class_schedules(room_id, scheduled_date);
CREATE INDEX idx_class_schedules_status ON class_schedules(status);
CREATE INDEX idx_pt_sessions_member ON personal_training_sessions(member_id, scheduled_date DESC);
CREATE INDEX idx_pt_sessions_trainer ON personal_training_sessions(trainer_id, scheduled_date DESC);
CREATE INDEX idx_pt_sessions_date ON personal_training_sessions(scheduled_date, start_time);
CREATE INDEX idx_pt_sessions_status ON personal_training_sessions(status);
CREATE INDEX idx_class_registrations_member ON class_registrations(member_id);
CREATE INDEX idx_class_registrations_schedule ON class_registrations(schedule_id);
CREATE INDEX idx_class_registrations_waitlist ON class_registrations(schedule_id, waitlist_position) WHERE waitlist_position IS NOT NULL;
CREATE INDEX idx_trainer_availability_trainer ON trainer_availability(trainer_id, day_of_week);
CREATE INDEX idx_trainer_availability_dates ON trainer_availability(effective_date, end_date);
CREATE INDEX idx_bills_member ON bills(member_id, status);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_due_date ON bills(due_date) WHERE status = 'pending';
CREATE INDEX idx_maintenance_logs_equipment ON maintenance_logs(equipment_id);
CREATE INDEX idx_maintenance_logs_status ON maintenance_logs(status);
CREATE INDEX idx_maintenance_logs_assigned ON maintenance_logs(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_trainers_specialization ON trainers USING GIN(specialization);

-- ============================================
-- VIEWS
-- ============================================

-- Member Dashboard View (comprehensive aggregated view)
CREATE OR REPLACE VIEW member_dashboard_view AS
SELECT 
    m.member_id,
    m.first_name,
    m.last_name,
    m.membership_status,
    -- Latest health metrics
    (SELECT weight FROM health_metrics 
     WHERE member_id = m.member_id 
     ORDER BY recorded_at DESC LIMIT 1) as latest_weight,
    (SELECT bmi FROM health_metrics 
     WHERE member_id = m.member_id 
     ORDER BY recorded_at DESC LIMIT 1) as latest_bmi,
    (SELECT recorded_at FROM health_metrics 
     WHERE member_id = m.member_id 
     ORDER BY recorded_at DESC LIMIT 1) as last_metric_date,
    -- Weight change in last 30 days
    (SELECT 
        (SELECT weight FROM health_metrics 
         WHERE member_id = m.member_id 
         ORDER BY recorded_at DESC LIMIT 1) - 
        (SELECT weight FROM health_metrics 
         WHERE member_id = m.member_id 
         AND recorded_at >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY recorded_at ASC LIMIT 1)
    ) as weight_change_30_days,
    -- Active goals count
    (SELECT COUNT(*) FROM fitness_goals 
     WHERE member_id = m.member_id AND status = 'active') as active_goals_count,
    -- Total classes attended
    (SELECT COUNT(*) FROM class_registrations cr
     JOIN class_schedules cs ON cr.schedule_id = cs.schedule_id
     WHERE cr.member_id = m.member_id 
     AND cr.attendance_status = 'attended'
     AND cs.status = 'completed') as total_classes_attended,
    -- Total PT sessions completed
    (SELECT COUNT(*) FROM personal_training_sessions 
     WHERE member_id = m.member_id AND status = 'completed') as total_pt_sessions,
    -- Upcoming PT sessions count
    (SELECT COUNT(*) FROM personal_training_sessions 
     WHERE member_id = m.member_id 
     AND status = 'scheduled'
     AND (scheduled_date > CURRENT_DATE OR (scheduled_date = CURRENT_DATE AND start_time > CURRENT_TIME))) as upcoming_pt_sessions,
    -- Upcoming classes count
    (SELECT COUNT(*) FROM class_registrations cr
     JOIN class_schedules cs ON cr.schedule_id = cs.schedule_id
     WHERE cr.member_id = m.member_id 
     AND cr.attendance_status = 'registered'
     AND (cs.scheduled_date > CURRENT_DATE OR (cs.scheduled_date = CURRENT_DATE AND cs.start_time > CURRENT_TIME))) as upcoming_classes,
    -- Outstanding balance
    (SELECT COALESCE(SUM(total_amount), 0) FROM bills 
     WHERE member_id = m.member_id AND status IN ('pending', 'overdue')) as outstanding_balance
FROM members m;

-- Trainer Schedule View (combined PT and class schedule)
CREATE OR REPLACE VIEW trainer_schedule_view AS
SELECT 
    t.trainer_id,
    t.first_name || ' ' || t.last_name as trainer_name,
    'PT Session' as event_type,
    pts.session_id as event_id,
    pts.scheduled_date,
    pts.start_time,
    pts.end_time,
    m.first_name || ' ' || m.last_name as member_name,
    r.room_name,
    pts.status::TEXT as status
FROM trainers t
JOIN personal_training_sessions pts ON t.trainer_id = pts.trainer_id
JOIN members m ON pts.member_id = m.member_id
LEFT JOIN rooms r ON pts.room_id = r.room_id
WHERE pts.status = 'scheduled'
UNION ALL
SELECT 
    t.trainer_id,
    t.first_name || ' ' || t.last_name as trainer_name,
    'Group Class' as event_type,
    cs.schedule_id as event_id,
    cs.scheduled_date,
    cs.start_time,
    cs.end_time,
    gc.class_name as member_name,
    r.room_name,
    cs.status::TEXT as status
FROM trainers t
JOIN class_schedules cs ON t.trainer_id = cs.trainer_id
JOIN group_classes gc ON cs.class_id = gc.class_id
JOIN rooms r ON cs.room_id = r.room_id
WHERE cs.status = 'scheduled'
ORDER BY scheduled_date, start_time;

-- Room Utilization View
CREATE OR REPLACE VIEW room_utilization_view AS
SELECT 
    r.room_id,
    r.room_name,
    r.capacity,
    -- Count of scheduled classes today
    (SELECT COUNT(*) FROM class_schedules 
     WHERE room_id = r.room_id 
     AND scheduled_date = CURRENT_DATE
     AND status = 'scheduled') as classes_today,
    -- Count of PT sessions today
    (SELECT COUNT(*) FROM personal_training_sessions 
     WHERE room_id = r.room_id 
     AND scheduled_date = CURRENT_DATE
     AND status = 'scheduled') as pt_sessions_today,
    -- Utilization percentage (based on hours booked today)
    ROUND(
        (SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600), 0)
         FROM (
             SELECT start_time, end_time FROM class_schedules 
             WHERE room_id = r.room_id AND scheduled_date = CURRENT_DATE AND status = 'scheduled'
             UNION ALL
             SELECT start_time, end_time FROM personal_training_sessions 
             WHERE room_id = r.room_id AND scheduled_date = CURRENT_DATE AND status = 'scheduled'
         ) bookings
        ) / 24.0 * 100, 2
    ) as utilization_percentage_today,
    r.is_active
FROM rooms r;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_class_capacity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE class_schedules
        SET current_capacity = current_capacity + 1
        WHERE schedule_id = NEW.schedule_id;
        
        -- Check if capacity exceeded and move to waitlist
        IF (SELECT current_capacity FROM class_schedules WHERE schedule_id = NEW.schedule_id) >
           (SELECT max_capacity FROM group_classes gc 
            JOIN class_schedules cs ON gc.class_id = cs.class_id 
            WHERE cs.schedule_id = NEW.schedule_id) THEN
            -- Move last registered person to waitlist
            UPDATE class_registrations
            SET waitlist_position = (
                SELECT COALESCE(MAX(waitlist_position), 0) + 1 
                FROM class_registrations 
                WHERE schedule_id = NEW.schedule_id AND waitlist_position IS NOT NULL
            )
            WHERE registration_id = (
                SELECT registration_id FROM class_registrations
                WHERE schedule_id = NEW.schedule_id 
                AND waitlist_position IS NULL
                ORDER BY registration_date DESC
                LIMIT 1
            );
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE class_schedules
        SET current_capacity = current_capacity - 1
        WHERE schedule_id = OLD.schedule_id;
        
        -- Promote first waitlist person
        UPDATE class_registrations
        SET waitlist_position = NULL
        WHERE registration_id = (
            SELECT registration_id FROM class_registrations
            WHERE schedule_id = OLD.schedule_id 
            AND waitlist_position IS NOT NULL
            ORDER BY waitlist_position ASC
            LIMIT 1
        );
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_class_capacity
AFTER INSERT OR DELETE ON class_registrations
FOR EACH ROW EXECUTE FUNCTION update_class_capacity();

CREATE OR REPLACE FUNCTION check_room_availability_class()
RETURNS TRIGGER AS $$
DECLARE
    conflicting_schedule INTEGER;
    conflicting_session INTEGER;
BEGIN
    SELECT schedule_id INTO conflicting_schedule
    FROM class_schedules
    WHERE room_id = NEW.room_id
    AND scheduled_date = NEW.scheduled_date
    AND status = 'scheduled'
    AND (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
    AND schedule_id != NEW.schedule_id;
    
    IF conflicting_schedule IS NOT NULL THEN
        RAISE EXCEPTION 'Room is already booked for this time slot (Class Schedule ID: %)', conflicting_schedule;
    END IF;
    
    SELECT session_id INTO conflicting_session
    FROM personal_training_sessions
    WHERE room_id = NEW.room_id
    AND scheduled_date = NEW.scheduled_date
    AND status = 'scheduled'
    AND (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time);
    
    IF conflicting_session IS NOT NULL THEN
        RAISE EXCEPTION 'Room is already booked for this time slot (PT Session ID: %)', conflicting_session;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_room_availability_pt()
RETURNS TRIGGER AS $$
DECLARE
    conflicting_schedule INTEGER;
    conflicting_session INTEGER;
BEGIN
    SELECT schedule_id INTO conflicting_schedule
    FROM class_schedules
    WHERE room_id = NEW.room_id
    AND scheduled_date = NEW.scheduled_date
    AND status = 'scheduled'
    AND (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time);
    
    IF conflicting_schedule IS NOT NULL THEN
        RAISE EXCEPTION 'Room is already booked for this time slot (Class Schedule ID: %)', conflicting_schedule;
    END IF;
    
    SELECT session_id INTO conflicting_session
    FROM personal_training_sessions
    WHERE room_id = NEW.room_id
    AND scheduled_date = NEW.scheduled_date
    AND status = 'scheduled'
    AND (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
    AND session_id != NEW.session_id;
    
    IF conflicting_session IS NOT NULL THEN
        RAISE EXCEPTION 'Room is already booked for this time slot (PT Session ID: %)', conflicting_session;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_room_availability_class
BEFORE INSERT OR UPDATE ON class_schedules
FOR EACH ROW EXECUTE FUNCTION check_room_availability_class();

CREATE TRIGGER trigger_check_room_availability_pt
BEFORE INSERT OR UPDATE ON personal_training_sessions
FOR EACH ROW EXECUTE FUNCTION check_room_availability_pt();

CREATE OR REPLACE FUNCTION update_member_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE members
    SET membership_status = 'active'
    WHERE member_id = NEW.member_id
    AND membership_status != 'cancelled';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_member_activity_pt
AFTER INSERT ON personal_training_sessions
FOR EACH ROW EXECUTE FUNCTION update_member_activity();

CREATE TRIGGER trigger_update_member_activity_registration
AFTER INSERT ON class_registrations
FOR EACH ROW EXECUTE FUNCTION update_member_activity();

CREATE OR REPLACE FUNCTION update_trainer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE trainers
        SET total_sessions = total_sessions + 1
        WHERE trainer_id = NEW.trainer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trainer_stats
AFTER UPDATE ON personal_training_sessions
FOR EACH ROW EXECUTE FUNCTION update_trainer_stats();

CREATE OR REPLACE FUNCTION update_bill_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' AND NEW.due_date < CURRENT_DATE THEN
        NEW.status := 'overdue';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bill_status
BEFORE INSERT OR UPDATE ON bills
FOR EACH ROW EXECUTE FUNCTION update_bill_status();

CREATE OR REPLACE FUNCTION update_bill_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE bills
        SET subtotal = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM bill_items
            WHERE bill_id = NEW.bill_id
        )
        WHERE bill_id = NEW.bill_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE bills
        SET subtotal = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM bill_items
            WHERE bill_id = OLD.bill_id
        )
        WHERE bill_id = OLD.bill_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bill_subtotal
AFTER INSERT OR UPDATE OR DELETE ON bill_items
FOR EACH ROW EXECUTE FUNCTION update_bill_subtotal();

CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


