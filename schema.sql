-- EdTech CRM & Inquiry Management System
-- Database Schema (PostgreSQL)
-- Generated from SQLAlchemy models per PRD v1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

------------------------------------------------------------
-- institutions
------------------------------------------------------------
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(40) UNIQUE,
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

------------------------------------------------------------
-- roles
------------------------------------------------------------
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(40) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

------------------------------------------------------------
-- users
------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    full_name VARCHAR(120) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

------------------------------------------------------------
-- counsellors (profile extension of users)
------------------------------------------------------------
CREATE TABLE counsellors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    team_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

------------------------------------------------------------
-- students
------------------------------------------------------------
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    date_of_birth DATE,
    academic_background TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

------------------------------------------------------------
-- courses
------------------------------------------------------------
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    code VARCHAR(40) NOT NULL,
    description TEXT,
    duration_months INTEGER NOT NULL CHECK (duration_months > 0),
    fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
    currency CHAR(3) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (institution_id, code)
);

------------------------------------------------------------
-- inquiries
------------------------------------------------------------
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    source VARCHAR(60),
    status VARCHAR(40) NOT NULL DEFAULT 'new',
    notes TEXT,
    lost_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ix_inquiries_institution_status ON inquiries(institution_id, status);
CREATE INDEX ix_inquiries_institution_created ON inquiries(institution_id, created_at);
CREATE INDEX ix_inquiries_assigned_status ON inquiries(assigned_to, status);

------------------------------------------------------------
-- follow_ups
------------------------------------------------------------
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_at TIMESTAMPTZ NOT NULL,
    channel VARCHAR(30),
    purpose TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    outcome TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ix_follow_ups_due_status ON follow_ups(due_at, status);
CREATE INDEX ix_follow_ups_owner_status ON follow_ups(assigned_to, status);

------------------------------------------------------------
-- inquiry_activities (audit trail)
------------------------------------------------------------
CREATE TABLE inquiry_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    from_status VARCHAR(40),
    to_status VARCHAR(40),
    notes TEXT,
    activity_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ix_activities_inquiry_created ON inquiry_activities(inquiry_id, created_at);

------------------------------------------------------------
-- enrollments
------------------------------------------------------------
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    fee_agreed NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (inquiry_id)
);

------------------------------------------------------------
-- notifications
------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    body TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ix_notifications_user_created ON notifications(user_id, created_at);

------------------------------------------------------------
-- Seed data: Roles
------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES
    (uuid_generate_v4(), 'super_admin', 'Platform-level configuration and support'),
    (uuid_generate_v4(), 'institution_admin', 'Manages institution users, courses, inquiry policies'),
    (uuid_generate_v4(), 'admission_manager', 'Monitors team workload and conversion performance'),
    (uuid_generate_v4(), 'counsellor', 'Works an assigned inquiry queue');
