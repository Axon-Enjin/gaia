-- Dev/demo content for the published test course (idempotent).
-- Targets course c3333333-3333-4333-8333-333333333332 when present.

insert into public.lessons (id, course_id, order_index, title, body_md, difficulty)
values
  (
    '33333333-3333-4333-8333-333333333301',
    'c3333333-3333-4333-8333-333333333332',
    0,
    'Introduction to Sustainable Farming',
    'Sustainable farming protects soil, water, and biodiversity while keeping harvests reliable for smallholders.

Key practices include crop rotation, cover crops, and reducing chemical inputs where safe alternatives exist.',
    'beginner'
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    'c3333333-3333-4333-8333-333333333332',
    1,
    'Soil Health Basics',
    'Healthy soil holds water, stores nutrients, and supports root growth.

Farmers improve soil by adding organic matter, avoiding compaction, and testing pH before applying amendments.',
    'beginner'
  )
on conflict (id) do nothing;

insert into public.quiz_questions (id, lesson_id, prompt, choices, answer_index)
values
  (
    '44444444-4444-4444-8444-444444444401',
    '33333333-3333-4333-8333-333333333301',
    'Which practice helps protect soil between growing seasons?',
    '["Cover crops", "Deep tilling every week", "Burning stubble daily"]'::jsonb,
    0
  ),
  (
    '44444444-4444-4444-8444-444444444402',
    '33333333-3333-4333-8333-333333333301',
    'Sustainable farming aims to balance productivity with:',
    '["Long-term environmental health", "Maximum short-term extraction only", "Eliminating all crop diversity"]'::jsonb,
    0
  ),
  (
    '44444444-4444-4444-8444-444444444403',
    '33333333-3333-4333-8333-333333333302',
    'Organic matter in soil mainly improves:',
    '["Water retention and nutrient storage", "Only surface color", "Nothing measurable"]'::jsonb,
    0
  ),
  (
    '44444444-4444-4444-8444-444444444404',
    '33333333-3333-4333-8333-333333333302',
    'Before applying lime or fertilizer, a farmer should:',
    '["Test soil pH and nutrient levels", "Apply the same dose every field", "Skip testing to save time"]'::jsonb,
    0
  )
on conflict (id) do nothing;
