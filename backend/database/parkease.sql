CREATE DATABASE IF NOT EXISTS parkease
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parkease;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS parking_slots;
DROP TABLE IF EXISTS parking_locations;

CREATE TABLE parking_locations (
    parking_location_id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    area VARCHAR(120) NOT NULL,
    icon VARCHAR(20) DEFAULT '🅿️',
    description VARCHAR(255),
    status ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB;

CREATE TABLE parking_slots (
    slot_id INT PRIMARY KEY,
    parking_location_id VARCHAR(30) NOT NULL,
    zone VARCHAR(10) NOT NULL,
    slot_type ENUM('Car','Bike','EV') NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    status ENUM('available','occupied','inactive') NOT NULL DEFAULT 'available',
    CONSTRAINT fk_slot_location
        FOREIGN KEY (parking_location_id) REFERENCES parking_locations(parking_location_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_type ENUM('Car','Bike','EV') NOT NULL DEFAULT 'Car',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE bookings (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('confirmed','cancelled','completed') NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_slot
        FOREIGN KEY (slot_id) REFERENCES parking_slots(slot_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_booking_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO parking_locations
(parking_location_id, name, area, icon, description) VALUES
('mall','Orion City Mall','Downtown','🛍️','Covered multi-level parking next to the food court.'),
('stadium','Greenfield Stadium','Sports District','🏟️','Open parking right outside Gate 3. Book early on match days.'),
('airport','Skyline Airport','Terminal Road','✈️','Short and long stay parking, 2 minutes from departures.'),
('hospital','City Care Hospital','North Avenue','🏥','Visitor parking close to the main entrance.');

INSERT INTO parking_slots
(slot_id, parking_location_id, zone, slot_type, hourly_rate, status) VALUES
(1,'mall','A','Car',40,'available'),
(2,'mall','A','Car',40,'occupied'),
(3,'mall','A','EV',60,'available'),
(4,'mall','B','Bike',15,'available'),
(5,'mall','B','Bike',15,'occupied'),
(6,'mall','B','Car',40,'available'),
(7,'mall','C','EV',60,'available'),
(8,'mall','C','Bike',15,'available'),
(11,'stadium','A','Car',40,'occupied'),
(12,'stadium','A','Car',40,'available'),
(13,'stadium','A','EV',60,'available'),
(14,'stadium','B','Bike',15,'available'),
(15,'stadium','B','Bike',15,'available'),
(16,'stadium','B','Car',40,'occupied'),
(17,'stadium','C','EV',60,'available'),
(18,'stadium','C','Bike',15,'available'),
(21,'airport','A','Car',40,'available'),
(22,'airport','A','Car',40,'available'),
(23,'airport','A','EV',60,'occupied'),
(24,'airport','B','Bike',15,'available'),
(25,'airport','B','Bike',15,'available'),
(26,'airport','B','Car',40,'available'),
(27,'airport','C','EV',60,'available'),
(28,'airport','C','Bike',15,'occupied'),
(31,'hospital','A','Car',40,'available'),
(32,'hospital','A','Car',40,'occupied'),
(33,'hospital','A','EV',60,'available'),
(34,'hospital','B','Bike',15,'available'),
(35,'hospital','B','Bike',15,'available'),
(36,'hospital','B','Car',40,'available'),
(37,'hospital','C','EV',60,'occupied'),
(38,'hospital','C','Bike',15,'available');
