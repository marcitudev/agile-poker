CREATE TABLE IF NOT EXISTS sprints(
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL CHECK(LENGTH(name) >= 3 AND LENGTH(name) <= 50),
	created_at DATE NOT NULL DEFAULT current_date,
	conclusion_date DATE NULL,
	room_id INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
)