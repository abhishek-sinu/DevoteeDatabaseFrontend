-- Create table to store user's sadhana template preferences
-- This table tracks which fields each user wants to see in their sadhana entry form

CREATE TABLE sadhana_user_template (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    devotee_id INTEGER,
    
    -- Core fields (always true, included for completeness)
    entry_date BOOLEAN DEFAULT TRUE,
    wake_up_time BOOLEAN DEFAULT TRUE,
    chanting_rounds BOOLEAN DEFAULT TRUE,
    reading_time BOOLEAN DEFAULT TRUE,
    reading_topic BOOLEAN DEFAULT TRUE,
    hearing_time BOOLEAN DEFAULT TRUE,
    hearing_topic BOOLEAN DEFAULT TRUE,
    service_name BOOLEAN DEFAULT TRUE,
    service_time BOOLEAN DEFAULT TRUE,
    
    -- Optional fields (user customizable)
    sleeping_time BOOLEAN DEFAULT FALSE,
    chanting_before_700 BOOLEAN DEFAULT FALSE,
    chanting_before_730 BOOLEAN DEFAULT FALSE,
    attended_mangal_arati BOOLEAN DEFAULT FALSE,
    attended_bhagavatam_class BOOLEAN DEFAULT FALSE,
    book_distribution BOOLEAN DEFAULT FALSE,
    prasadam_honored BOOLEAN DEFAULT FALSE,
    ekadashi_followed BOOLEAN DEFAULT FALSE,
    japa_quality BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_email FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX idx_sadhana_template_email ON sadhana_user_template(user_email);
CREATE INDEX idx_sadhana_template_devotee ON sadhana_user_template(devotee_id);

-- Optional: Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sadhana_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sadhana_template_timestamp
BEFORE UPDATE ON sadhana_user_template
FOR EACH ROW
EXECUTE FUNCTION update_sadhana_template_timestamp();
