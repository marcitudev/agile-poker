CREATE TABLE IF NOT EXISTS custom_card_values(
    id SERIAL PRIMARY KEY,
    values integer[] NOT NULL,
    room_id INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE (room_id)
)