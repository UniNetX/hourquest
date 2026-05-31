-- Medical track challenges (run after track migration)

insert into public.challenges (title, description, proof_instructions, track, category, difficulty, hours_earned, points, sort_order) values
-- Health Education (3)
('Teach a friend or family member one healthy habit', 'Explain and demonstrate one healthy habit (hydration, sleep, hand washing, etc.) to someone else.', 'Photo of you teaching or a short note signed by the person who learned.', 'medical', 'health_education', 'easy', 0.5, 50, 0),
('Create a one-page health tip sheet for your school or club', 'Design a simple one-page handout with accurate health tips for students.', 'Photo of the finished handout or screenshot if digital.', 'medical', 'health_education', 'medium', 1, 100, 1),
('Lead a 15-minute health Q&A for at least 3 peers', 'Host a short Q&A on a health topic you researched (with credible sources).', 'Group photo or screenshot of your notes and attendees.', 'medical', 'health_education', 'hard', 2, 200, 2),
-- Wellness & Prevention (3)
('Walk 30 minutes a day for five days straight', 'Walk at least 30 minutes each day for five consecutive days for wellness.', 'Photo or simple log showing dates and activity.', 'medical', 'wellness', 'easy', 0.5, 50, 0),
('Complete a full week of 7–8 hours of sleep', 'Prioritize 7–8 hours of sleep each night for seven days.', 'Sleep log or journal photo covering the week.', 'medical', 'wellness', 'medium', 1, 100, 1),
('Try a new stress-relief activity for one week', 'Practice one stress-relief method (journaling, stretching, breathing) daily for seven days.', 'Photo of your journal, app log, or checklist for the week.', 'medical', 'wellness', 'medium', 1, 100, 2),
-- First Aid & Safety (3)
('Build or refresh a home first-aid kit', 'Assemble or update a basic first-aid kit at home with essential supplies.', 'Photo of your completed first-aid kit.', 'medical', 'first_aid', 'easy', 0.5, 50, 0),
('Complete an online first-aid or CPR awareness module', 'Finish a reputable free first-aid or CPR awareness training online.', 'Screenshot of course completion certificate or screen.', 'medical', 'first_aid', 'medium', 1, 100, 1),
('Practice the recovery position with a partner', 'Learn and demonstrate the recovery position with a friend or family member.', 'Photo of both people during practice (safe setting).', 'medical', 'first_aid', 'medium', 1, 100, 2),
-- Mental Health Awareness (3)
('Share three mental-health resources with your community', 'Research and share three credible mental-health resources (hotlines, school counselor, etc.).', 'Screenshot of message/post or photo of printed resource list.', 'medical', 'mental_health', 'easy', 0.5, 50, 0),
('Write a gratitude list every day for one week', 'Write at least three gratitudes daily for seven days.', 'Photo of one page from your journal (personal details blurred).', 'medical', 'mental_health', 'easy', 0.5, 50, 1),
('Organize a peer check-in circle with at least 3 friends', 'Host a supportive check-in (no therapy claims) where everyone shares how they are doing.', 'Group photo or signed note from participants.', 'medical', 'mental_health', 'hard', 2, 200, 2),
-- Nutrition & Healthy Habits (3)
('Eat a balanced meal with vegetables every day for five days', 'Include vegetables in lunch or dinner for five consecutive days.', 'Photos of meals or a simple five-day meal log.', 'medical', 'nutrition', 'easy', 0.5, 50, 0),
('Replace sugary drinks with water for one full week', 'Drink water instead of soda, energy drinks, or sugary beverages for seven days.', 'Photo of your water bottle and weekly checklist.', 'medical', 'nutrition', 'medium', 1, 100, 1),
('Prepare a healthy snack for yourself and one other person', 'Make a nutritious snack (fruit, nuts, yogurt, etc.) for you and someone else.', 'Photo of the snack you prepared and shared.', 'medical', 'nutrition', 'easy', 0.5, 50, 2),
-- Community Health Service (3)
('Volunteer at a health-related community event for 1 hour', 'Volunteer at least one hour at a health fair, blood drive, or similar community event.', 'Photo at the event or signed volunteer confirmation.', 'medical', 'community_health', 'hard', 2, 200, 0),
('Donate hygiene supplies to a local shelter or drive', 'Donate new hygiene items (soap, toothpaste, etc.) to an approved collection point.', 'Photo at drop-off with donated items.', 'medical', 'community_health', 'medium', 1, 100, 1),
('Help an elderly neighbor with a wellness errand', 'Assist a neighbor with a health-related errand (pharmacy pickup, appointment ride, etc.) with permission.', 'Photo or thank-you note (no private medical details visible).', 'medical', 'community_health', 'medium', 1, 100, 2);
