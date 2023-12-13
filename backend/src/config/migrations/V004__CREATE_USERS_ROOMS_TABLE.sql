CREATE TABLE IF NOT EXISTS users_rooms(
	user_id INT NOT NULL,
	room_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE (user_id, room_id)
);