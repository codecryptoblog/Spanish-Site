-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_code TEXT NOT NULL UNIQUE
);

-- User Roles Enum
CREATE TYPE user_role AS ENUM ('teacher', 'student');

-- User Subscription Type Enum
CREATE TYPE subscription_type AS ENUM ('free', 'premium');

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    role user_role DEFAULT 'student',
    class_id UUID REFERENCES classes(id),
    native_language TEXT DEFAULT 'english',
    subscription_type subscription_type DEFAULT 'free' -- New column
);

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject_id UUID REFERENCES subjects(id),
    created_by UUID REFERENCES users(id)
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    lesson_id UUID REFERENCES lessons(id),
    due_date TIMESTAMPTZ
);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    score INTEGER DEFAULT 0
);