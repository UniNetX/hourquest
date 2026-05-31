-- Seed 30 PRD challenges

insert into public.challenges (title, description, proof_instructions, track, category, difficulty, hours_earned, points, sort_order) values
-- Clean Up (6)
('Pick up trash anywhere in your community for 30 minutes', 'Spend at least 30 minutes collecting litter in your neighborhood, park, or community space.', 'Photo showing you with trash bags or collected litter in a public area.', 'environmental', 'cleanup', 'easy', 0.5, 50, 0),
('Fill at least 2 full bags of trash from anywhere in your community', 'Collect and properly dispose of at least two full bags of trash from your community.', 'Photo of two filled trash bags ready for disposal.', 'environmental', 'cleanup', 'medium', 1, 100, 1),
('Organize a community cleanup with at least 3 friends', 'Lead a small group cleanup with at least three friends in your community.', 'Group photo of all participants with collected trash.', 'environmental', 'cleanup', 'hard', 2, 200, 2),
('Clean up a beach or riverbank near your community', 'Remove litter from a beach, lake shore, or riverbank in your area.', 'Before and after photos of the cleaned shoreline.', 'environmental', 'cleanup', 'medium', 1, 100, 3),
('Remove trash from a sports field or recreational area', 'Clean up litter from a local sports field, playground, or recreational area.', 'Photo of cleaned area with collected trash visible.', 'environmental', 'cleanup', 'easy', 0.5, 50, 4),
('Clean up a storm drain or catch basin near your home', 'Clear debris and litter from a storm drain or catch basin near your home.', 'Photo showing the cleaned storm drain area.', 'environmental', 'cleanup', 'easy', 0.5, 50, 5),
-- Plant & Grow (5)
('Plant a flower, small plant, or herb anywhere', 'Plant at least one flower, herb, or small plant in a pot, garden, or community space.', 'Photo of you planting or the finished planted item.', 'environmental', 'plant', 'easy', 0.5, 50, 0),
('Spread wildflower seeds in an empty patch of land in your community', 'Sow wildflower seeds in an appropriate empty patch of land in your community.', 'Photo of the seeded area with seed packet visible.', 'environmental', 'plant', 'easy', 0.5, 50, 1),
('Start a compost bin at home', 'Set up a working compost bin or compost system at home.', 'Photo of your compost bin with materials added.', 'environmental', 'plant', 'medium', 1, 100, 2),
('Plant at least 3 different plants in a community space', 'Plant three or more different plants in an approved community space.', 'Photo showing all three plants labeled or visible.', 'environmental', 'plant', 'hard', 2, 200, 3),
('Create a small pollinator garden with native flowers', 'Design and plant a small pollinator garden using native flowers.', 'Photo of the pollinator garden with native plants.', 'environmental', 'plant', 'medium', 1, 100, 4),
-- Reduce Waste (6)
('Bring reusable bags to the grocery store', 'Use reusable bags for an entire grocery shopping trip.', 'Photo at the store with reusable bags filled with groceries.', 'environmental', 'waste', 'easy', 0.5, 50, 0),
('Go one full day with zero single-use plastic', 'Avoid all single-use plastic for one full day.', 'Photo journal or collage showing plastic-free alternatives used.', 'environmental', 'waste', 'easy', 0.5, 50, 1),
('Donate a bag of old clothes instead of throwing them away', 'Donate at least one bag of clothes to a thrift store or donation center.', 'Photo at the donation drop-off with your bag of clothes.', 'environmental', 'waste', 'easy', 0.5, 50, 2),
('Collect and recycle old batteries or electronics from your home', 'Properly collect and recycle batteries or small electronics from home.', 'Photo at a recycling drop-off with collected items.', 'environmental', 'waste', 'medium', 1, 100, 3),
('Use a reusable water bottle every day for one full week', 'Use only a reusable water bottle for drinking water for seven days.', 'Photo of your reusable bottle used across the week.', 'environmental', 'waste', 'medium', 1, 100, 4),
('Finish all your food for one week — zero food waste', 'Eat or save all prepared food with zero waste for one week.', 'Photo showing meal planning or compost of unavoidable scraps only.', 'environmental', 'waste', 'medium', 1, 100, 5),
-- Water & Energy (5)
('Turn off lights every time you leave a room for one full week', 'Turn off lights when leaving any room for seven consecutive days.', 'Photo checklist or journal entry documenting the week.', 'environmental', 'water', 'easy', 0.5, 50, 0),
('Turn off the tap while brushing teeth for one full week', 'Keep the tap off while brushing teeth for seven days.', 'Photo of a note or checklist tracking the habit.', 'environmental', 'water', 'easy', 0.5, 50, 1),
('Take 5-minute showers for 5 days straight', 'Limit showers to five minutes for five consecutive days.', 'Photo of a timer or shower checklist.', 'environmental', 'water', 'medium', 1, 100, 2),
('Unplug all chargers and electronics when not in use for one full week', 'Unplug chargers and idle electronics when not in use for seven days.', 'Photo showing unplugged devices at home.', 'environmental', 'water', 'medium', 1, 100, 3),
('Walk or bike instead of getting a car ride for one full week', 'Use walking or biking instead of car rides for transportation for seven days.', 'Photo of you walking or biking to a destination.', 'environmental', 'water', 'hard', 2, 200, 4),
-- Social & Awareness (5)
('Post an environmental tip on Instagram and tag HourQuest', 'Share an environmental tip on Instagram and tag @HourQuest.', 'Screenshot of your Instagram post with HourQuest tagged.', 'environmental', 'social', 'easy', 0.5, 50, 0),
('Share a photo of nature in your community on social media', 'Post a photo of local nature on social media with an environmental caption.', 'Screenshot of your social media post.', 'environmental', 'social', 'easy', 0.5, 50, 1),
('Post a before and after cleanup photo on social media', 'Share before and after photos from a cleanup on social media.', 'Screenshot showing both before and after in the post.', 'environmental', 'social', 'medium', 1, 100, 2),
('Get one friend to sign up for HourQuest', 'Invite a friend who creates an HourQuest account.', 'Screenshot of friend confirmation or referral message.', 'environmental', 'social', 'medium', 1, 100, 3),
('Teach a younger student about one environmental issue', 'Teach a younger student about a specific environmental topic.', 'Photo of the teaching session or educational materials used.', 'environmental', 'social', 'medium', 1, 100, 4),
-- Community (3)
('Volunteer at a local environmental organization for at least 1 hour', 'Volunteer at least one hour with a local environmental organization.', 'Photo at the organization or signed volunteer confirmation.', 'environmental', 'community', 'hard', 2, 200, 0),
('Attend a local environmental event or meeting', 'Attend a local environmental event, town hall, or community meeting.', 'Photo or event program showing your attendance.', 'environmental', 'community', 'medium', 1, 100, 1),
('Write a letter to your local government about an environmental issue', 'Write and send a letter to local government about an environmental concern.', 'Photo of the letter or email confirmation sent.', 'environmental', 'community', 'hard', 2, 200, 2)
on conflict do nothing;
