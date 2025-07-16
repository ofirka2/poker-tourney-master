-- Add table assignment columns to players table
ALTER TABLE public.players 
ADD COLUMN table_number INTEGER,
ADD COLUMN seat_number INTEGER;

-- Add index for better performance when querying by table assignments
CREATE INDEX idx_players_table_seat ON public.players(tournament_id, table_number, seat_number);

-- Add constraint to ensure table_number and seat_number are positive integers
ALTER TABLE public.players 
ADD CONSTRAINT check_table_number_positive CHECK (table_number IS NULL OR table_number > 0),
ADD CONSTRAINT check_seat_number_positive CHECK (seat_number IS NULL OR seat_number > 0);

-- Add constraint to ensure unique table/seat combinations within a tournament
ALTER TABLE public.players 
ADD CONSTRAINT unique_table_seat_per_tournament 
UNIQUE (tournament_id, table_number, seat_number) 
WHERE table_number IS NOT NULL AND seat_number IS NOT NULL; 