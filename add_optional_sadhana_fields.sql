-- Add optional fields to sadhana_entries table
-- Execute this SQL query manually in your database

ALTER TABLE sadhana_entries
ADD COLUMN sleeping_time TIME,
ADD COLUMN chanting_before_700 BOOLEAN DEFAULT FALSE,
ADD COLUMN chanting_before_730 BOOLEAN DEFAULT FALSE,
ADD COLUMN attended_mangal_arati BOOLEAN DEFAULT FALSE,
ADD COLUMN attended_bhagavatam_class BOOLEAN DEFAULT FALSE,
ADD COLUMN book_distribution INTEGER DEFAULT 0,
ADD COLUMN prasadam_honored BOOLEAN DEFAULT FALSE,
ADD COLUMN ekadashi_followed BOOLEAN DEFAULT FALSE,
ADD COLUMN japa_quality INTEGER;
