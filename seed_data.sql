-- Example seed data for user_id = 'user_3JesWdD4E7hXOHtzzSJCVFh9Byv'
-- 3 workouts (Push / Pull / Leg), 3 exercises each, 3 sets each exercise.
-- Review only — NOT executed against Neon yet.

-- ============ exercises ============
INSERT INTO exercises (id, name) VALUES
  ('edd199c1-92cd-4499-acf0-043b77fad24f', 'Barbell Bench Press'),
  ('051db894-c7a2-44a8-988d-cdb369125d5a', 'Overhead Press'),
  ('11f00718-10a8-42cd-aa71-83fa33a80afe', 'Incline Dumbbell Press'),
  ('57d2cfd2-87fb-4e81-8ef1-4f50b022e240', 'Barbell Row'),
  ('99a51b31-aeb2-42b5-855b-3fc4b469ba15', 'Pull-Up'),
  ('77c681af-b4d5-4c83-b78c-0d44e101ce4a', 'Lat Pulldown'),
  ('4f737089-9bd7-4017-afd1-3e2abd4c6e75', 'Back Squat'),
  ('9f6654b0-9fe0-43d1-8593-969eb4ba635d', 'Romanian Deadlift'),
  ('69651337-5351-4420-9d70-18a8db0d9ffd', 'Leg Press');

-- ============ workouts ============
INSERT INTO workouts (id, user_id, date, started_at, completed_at, name) VALUES
  ('058418ea-1768-43ba-8eb8-b2e7b4d36930', 'user_3JesWdD4E7hXOHtzzSJCVFh9Byv', '2026-09-15',
    '2026-09-15 07:00:00-04', '2026-09-15 08:05:00-04', 'Push Day'),
  ('3166c821-816d-4ba6-988f-323f433d3ea3', 'user_3JesWdD4E7hXOHtzzSJCVFh9Byv', '2026-09-17',
    '2026-09-17 07:00:00-04', '2026-09-17 08:10:00-04', 'Pull Day'),
  ('17ea4910-812d-4395-9ba5-f4ef5f6f3d65', 'user_3JesWdD4E7hXOHtzzSJCVFh9Byv', '2026-09-19',
    '2026-09-19 07:00:00-04', '2026-09-19 08:20:00-04', 'Leg Day');

-- ============ workout_exercises ============
INSERT INTO workout_exercises (id, workout_id, exercise_id, "order") VALUES
  -- Push Day
  ('017ee6a2-2c3d-47a4-836a-8048197b82aa', '058418ea-1768-43ba-8eb8-b2e7b4d36930', 'edd199c1-92cd-4499-acf0-043b77fad24f', 1), -- Bench Press
  ('3fdf70b5-39ba-49ff-a83a-520d54b5e37a', '058418ea-1768-43ba-8eb8-b2e7b4d36930', '051db894-c7a2-44a8-988d-cdb369125d5a', 2), -- Overhead Press
  ('62c5ee1f-c888-4afa-8ee5-e815bd5b223c', '058418ea-1768-43ba-8eb8-b2e7b4d36930', '11f00718-10a8-42cd-aa71-83fa33a80afe', 3), -- Incline DB Press
  -- Pull Day
  ('31944021-8cf3-4694-8d57-12ed3ba85ff1', '3166c821-816d-4ba6-988f-323f433d3ea3', '57d2cfd2-87fb-4e81-8ef1-4f50b022e240', 1), -- Barbell Row
  ('db55ad93-c0fd-4e9c-8fa5-bbe1f74fa99c', '3166c821-816d-4ba6-988f-323f433d3ea3', '99a51b31-aeb2-42b5-855b-3fc4b469ba15', 2), -- Pull-Up
  ('067de711-955e-4855-a758-c400d2cba23c', '3166c821-816d-4ba6-988f-323f433d3ea3', '77c681af-b4d5-4c83-b78c-0d44e101ce4a', 3), -- Lat Pulldown
  -- Leg Day
  ('6da784c9-ee93-4a2b-8630-706c77a2a3bd', '17ea4910-812d-4395-9ba5-f4ef5f6f3d65', '4f737089-9bd7-4017-afd1-3e2abd4c6e75', 1), -- Back Squat
  ('1a124441-602f-437b-a769-c9531385e361', '17ea4910-812d-4395-9ba5-f4ef5f6f3d65', '9f6654b0-9fe0-43d1-8593-969eb4ba635d', 2), -- Romanian Deadlift
  ('f07bffc3-faef-4645-a0d8-47c4c734410a', '17ea4910-812d-4395-9ba5-f4ef5f6f3d65', '69651337-5351-4420-9d70-18a8db0d9ffd', 3); -- Leg Press

-- ============ sets ============
INSERT INTO sets (workout_exercise_id, set_number, weight, reps) VALUES
  -- Bench Press
  ('017ee6a2-2c3d-47a4-836a-8048197b82aa', 1, 135, 10),
  ('017ee6a2-2c3d-47a4-836a-8048197b82aa', 2, 155, 8),
  ('017ee6a2-2c3d-47a4-836a-8048197b82aa', 3, 165, 6),
  -- Overhead Press
  ('3fdf70b5-39ba-49ff-a83a-520d54b5e37a', 1, 85, 10),
  ('3fdf70b5-39ba-49ff-a83a-520d54b5e37a', 2, 95, 8),
  ('3fdf70b5-39ba-49ff-a83a-520d54b5e37a', 3, 100, 6),
  -- Incline Dumbbell Press (weight = per-dumbbell)
  ('62c5ee1f-c888-4afa-8ee5-e815bd5b223c', 1, 50, 12),
  ('62c5ee1f-c888-4afa-8ee5-e815bd5b223c', 2, 55, 10),
  ('62c5ee1f-c888-4afa-8ee5-e815bd5b223c', 3, 60, 8),
  -- Barbell Row
  ('31944021-8cf3-4694-8d57-12ed3ba85ff1', 1, 135, 10),
  ('31944021-8cf3-4694-8d57-12ed3ba85ff1', 2, 145, 8),
  ('31944021-8cf3-4694-8d57-12ed3ba85ff1', 3, 155, 6),
  -- Pull-Up (bodyweight, weight = added load)
  ('db55ad93-c0fd-4e9c-8fa5-bbe1f74fa99c', 1, 0, 10),
  ('db55ad93-c0fd-4e9c-8fa5-bbe1f74fa99c', 2, 0, 8),
  ('db55ad93-c0fd-4e9c-8fa5-bbe1f74fa99c', 3, 10, 6),
  -- Lat Pulldown
  ('067de711-955e-4855-a758-c400d2cba23c', 1, 120, 12),
  ('067de711-955e-4855-a758-c400d2cba23c', 2, 130, 10),
  ('067de711-955e-4855-a758-c400d2cba23c', 3, 140, 8),
  -- Back Squat
  ('6da784c9-ee93-4a2b-8630-706c77a2a3bd', 1, 185, 8),
  ('6da784c9-ee93-4a2b-8630-706c77a2a3bd', 2, 205, 6),
  ('6da784c9-ee93-4a2b-8630-706c77a2a3bd', 3, 215, 5),
  -- Romanian Deadlift
  ('1a124441-602f-437b-a769-c9531385e361', 1, 155, 10),
  ('1a124441-602f-437b-a769-c9531385e361', 2, 175, 8),
  ('1a124441-602f-437b-a769-c9531385e361', 3, 185, 6),
  -- Leg Press
  ('f07bffc3-faef-4645-a0d8-47c4c734410a', 1, 270, 12),
  ('f07bffc3-faef-4645-a0d8-47c4c734410a', 2, 300, 10),
  ('f07bffc3-faef-4645-a0d8-47c4c734410a', 3, 320, 8);
