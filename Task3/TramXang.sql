CREATE TABLE GasStation (
    station_id INT PRIMARY KEY AUTO_INCREMENT,
    station_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL
);

CREATE TABLE Goods (
    goods_id INT PRIMARY KEY AUTO_INCREMENT,
    goods_name VARCHAR(255) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Pump (
    pump_id INT PRIMARY KEY AUTO_INCREMENT,
    station_id INT,
    goods_id INT,
    FOREIGN KEY (station_id) REFERENCES GasStation(station_id) ON DELETE CASCADE,
    FOREIGN KEY (goods_id) REFERENCES Goods(goods_id) ON DELETE SET NULL
);

CREATE TABLE Transaction (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    pump_id INT,
    station_id INT,
    goods_id INT,
    transaction_date DATETIME NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pump_id) REFERENCES Pump(pump_id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES GasStation(station_id) ON DELETE CASCADE,
    FOREIGN KEY (goods_id) REFERENCES Goods(goods_id) ON DELETE SET NULL
);
