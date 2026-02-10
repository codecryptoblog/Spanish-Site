CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE subscription_type AS ENUM ('free', 'premium');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role user_role DEFAULT 'student',
  class_id UUID REFERENCES classes(id),
  language TEXT DEFAULT 'english',
  subscription subscription_type DEFAULT 'free',
  points INT DEFAULT 0,
  lessons_completed INT DEFAULT 0,
  streak INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  created_by UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INT
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS class_students (
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, student_id)
);