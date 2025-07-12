CREATE TABLE games (VARCHAR(60),     
    id SERIAL PRIMARY KEY,            -- Auto-incrementing Game ID
    name VARCHAR(255) NOT NULL,        -- Name of the game
    date DATE NOT NULL,                -- Date of the game
    leader_name VARCHAR(60) NOT NULL,
    is_double BOOLEAN DEFAULT TRUE,              -- Add this line: the type reference
    points INT DEFAULT 25,                        -- Points for the game
    has_duece BOOLEAN DEFAULT TRUE,                     -- Deuce or not
    price INT DEFAULT 280,              -- Price for participating
    member_price INT DEFAULT 280,       -- Discounted price for members
    ball_included BOOLEAN DEFAULT TRUE,
    start_hour SMALLINT,                   -- Start time of the game
    end_hour SMALLINT,                     -- End time of the game
    max_numbers INT DEFAULT 24,                   -- Max number of participants
    low_level INT DEFAULT 1,                 -- Level of difficulty (e.g., beginner, intermediate, expert)
    high_level INT DEFAULT 20,
    image_name VARCHAR(255),           -- Name of the image associated with the game
    note VARCHAR(255),    --Extra memo
    fix_members TEXT,    --Extra memo
    is_perweek BOOLEAN DEFAULT TRUE,    --Created new after delete
    skip_thisweek BOOLEAN DEFAULT FALSE,
    skip_forever BOOLEAN DEFAULT FALSE,
    create_line_group VARCHAR(255),
    create_line_id VARCHAR(40),
    history TEXT

);

CREATE TABLE players (
    id SERIAL PRIMARY KEY,                 -- Auto-incrementing Player ID
    name VARCHAR(60) NOT NULL,             -- Player's name
    game_id INT NOT NULL,                  -- Foreign Key linking to Game table
    auto_rejoin BOOLEAN DEFAULT FALSE,    -- Auto-rejoin if player left
    paied_by_line BOOLEAN DEFAULT FALSE,   -- Paied by line or not
    joined_by VARCHAR(60),                 -- The line nickname of wWho invited this player
    joined_by_user_id VARCHAR(40),         -- The line user id of who invited this player
    joined_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When player joined
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE -- Auto-delete player if game is deleted
);

