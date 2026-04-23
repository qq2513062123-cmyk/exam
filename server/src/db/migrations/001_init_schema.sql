CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT profiles_role_check CHECK (role IN ('student', 'admin'))
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  stem text NOT NULL,
  options jsonb,
  correct_answer text,
  score integer NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT questions_type_check CHECK (
    type IN ('single_choice', 'true_false', 'short_answer')
  ),
  CONSTRAINT questions_score_check CHECK (score >= 0),
  CONSTRAINT questions_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES profiles(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes integer NOT NULL,
  start_time timestamptz,
  end_time timestamptz,
  status text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT exams_duration_minutes_check CHECK (duration_minutes > 0),
  CONSTRAINT exams_status_check CHECK (status IN ('draft', 'published', 'closed')),
  CONSTRAINT exams_time_range_check CHECK (
    start_time IS NULL OR end_time IS NULL OR end_time > start_time
  ),
  CONSTRAINT exams_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES profiles(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  question_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  score integer,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT exam_questions_score_check CHECK (score IS NULL OR score >= 0),
  CONSTRAINT exam_questions_exam_id_fkey FOREIGN KEY (exam_id)
    REFERENCES exams(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT exam_questions_question_id_fkey FOREIGN KEY (question_id)
    REFERENCES questions(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT exam_questions_exam_question_unique UNIQUE (exam_id, question_id)
);

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  total_score integer,
  objective_score integer,
  subjective_score integer,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT submissions_status_check CHECK (
    status IN ('in_progress', 'submitted', 'pending_review', 'graded')
  ),
  CONSTRAINT submissions_total_score_check CHECK (
    total_score IS NULL OR total_score >= 0
  ),
  CONSTRAINT submissions_objective_score_check CHECK (
    objective_score IS NULL OR objective_score >= 0
  ),
  CONSTRAINT submissions_subjective_score_check CHECK (
    subjective_score IS NULL OR subjective_score >= 0
  ),
  CONSTRAINT submissions_submitted_at_check CHECK (
    submitted_at IS NULL OR submitted_at >= started_at
  ),
  CONSTRAINT submissions_reviewed_at_check CHECK (
    reviewed_at IS NULL OR submitted_at IS NULL OR reviewed_at >= submitted_at
  ),
  CONSTRAINT submissions_exam_id_fkey FOREIGN KEY (exam_id)
    REFERENCES exams(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id)
    REFERENCES profiles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by)
    REFERENCES profiles(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT submissions_exam_student_unique UNIQUE (exam_id, student_id)
);

CREATE TABLE submission_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  question_id uuid NOT NULL,
  answer text,
  is_correct boolean,
  auto_score integer,
  manual_score integer,
  final_score integer,
  review_status text NOT NULL,
  reviewer_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT submission_answers_review_status_check CHECK (
    review_status IN ('none', 'pending_review', 'reviewed')
  ),
  CONSTRAINT submission_answers_auto_score_check CHECK (
    auto_score IS NULL OR auto_score >= 0
  ),
  CONSTRAINT submission_answers_manual_score_check CHECK (
    manual_score IS NULL OR manual_score >= 0
  ),
  CONSTRAINT submission_answers_final_score_check CHECK (
    final_score IS NULL OR final_score >= 0
  ),
  CONSTRAINT submission_answers_submission_id_fkey FOREIGN KEY (submission_id)
    REFERENCES submissions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT submission_answers_question_id_fkey FOREIGN KEY (question_id)
    REFERENCES questions(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT submission_answers_submission_question_unique UNIQUE (
    submission_id,
    question_id
  )
);

CREATE INDEX profiles_role_idx ON profiles(role);

CREATE INDEX questions_type_idx ON questions(type);
CREATE INDEX questions_created_by_idx ON questions(created_by);

CREATE INDEX exams_status_idx ON exams(status);
CREATE INDEX exams_created_by_idx ON exams(created_by);
CREATE INDEX exams_time_range_idx ON exams(start_time, end_time);

CREATE INDEX exam_questions_exam_id_idx ON exam_questions(exam_id);
CREATE INDEX exam_questions_question_id_idx ON exam_questions(question_id);
CREATE INDEX exam_questions_exam_sort_order_idx ON exam_questions(exam_id, sort_order);

CREATE INDEX submissions_exam_id_idx ON submissions(exam_id);
CREATE INDEX submissions_student_id_idx ON submissions(student_id);
CREATE INDEX submissions_status_idx ON submissions(status);
CREATE INDEX submissions_reviewed_by_idx ON submissions(reviewed_by);

CREATE INDEX submission_answers_submission_id_idx ON submission_answers(submission_id);
CREATE INDEX submission_answers_question_id_idx ON submission_answers(question_id);
CREATE INDEX submission_answers_review_status_idx ON submission_answers(review_status);

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER questions_set_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER exams_set_updated_at
BEFORE UPDATE ON exams
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER submissions_set_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER submission_answers_set_updated_at
BEFORE UPDATE ON submission_answers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
