-- Hospital Management System Database Schema
-- Database: hospital_db

CREATE DATABASE IF NOT EXISTS hospital_db;
DROP DATABASE IF EXISTS hospital_db;
CREATE DATABASE hospital_db;
USE hospital_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Department table
CREATE TABLE IF NOT EXISTS department (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(100) NOT NULL,
  dept_head VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient table
CREATE TABLE IF NOT EXISTS patient (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  dob DATE,
  gender ENUM('Male','Female','Other') DEFAULT 'Male',
  phone VARCHAR(15),
  email VARCHAR(100),
  address TEXT,
  blood_group VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor table
CREATE TABLE IF NOT EXISTS doctor (
  doctor_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  specialization VARCHAR(100),
  phone VARCHAR(15),
  email VARCHAR(100),
  dept_id INT,
  qualification VARCHAR(100),
  experience_years INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE SET NULL
);

-- Appointment table
CREATE TABLE IF NOT EXISTS appointment (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  doctor_id INT,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  status ENUM('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE
);

-- Medicine table
CREATE TABLE IF NOT EXISTS medicine (
  medicine_id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_name VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100),
  price DECIMAL(10,2) DEFAULT 0.00,
  stock INT DEFAULT 0,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescription table
CREATE TABLE IF NOT EXISTS prescription (
  prescription_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  doctor_id INT,
  prescription_date DATE NOT NULL,
  diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE
);

-- Contains table (prescription-medicine junction)
CREATE TABLE IF NOT EXISTS `contains` (
  prescription_id INT,
  medicine_id INT,
  dosage VARCHAR(100),
  duration VARCHAR(50),
  frequency VARCHAR(50),
  PRIMARY KEY (prescription_id, medicine_id),
  FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id) ON DELETE CASCADE
);

-- Billing table
CREATE TABLE IF NOT EXISTS billing (
  bill_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  appointment_id INT,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_status ENUM('Pending','Paid','Partial') DEFAULT 'Pending',
  payment_method VARCHAR(50),
  billing_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE SET NULL
);

-- Seed data for departments
INSERT INTO department (dept_name, dept_head, description) VALUES
('Cardiology', 'Dr. Smith', 'Heart and cardiovascular system'),
('Neurology', 'Dr. Johnson', 'Brain and nervous system'),
('Orthopedics', 'Dr. Williams', 'Bones and joints'),
('Pediatrics', 'Dr. Brown', 'Children healthcare'),
('Dermatology', 'Dr. Davis', 'Skin related treatments'),
('General Medicine', 'Dr. Wilson', 'General health checkups');

-- Seed data for patients
INSERT INTO patient (first_name, last_name, dob, gender, phone, email, address, blood_group) VALUES
('John', 'Doe', '1990-05-15', 'Male', '555-0101', 'john.doe@email.com', '123 Main St', 'A+'),
('Jane', 'Smith', '1985-08-22', 'Female', '555-0102', 'jane.smith@email.com', '456 Oak Ave', 'B+'),
('Robert', 'Johnson', '1978-12-03', 'Male', '555-0103', 'robert.j@email.com', '789 Pine Rd', 'O+'),
('Emily', 'Williams', '1995-03-17', 'Female', '555-0104', 'emily.w@email.com', '321 Elm St', 'AB+'),
('Michael', 'Brown', '1982-07-28', 'Male', '555-0105', 'michael.b@email.com', '654 Maple Dr', 'A-');

-- Seed data for doctors
INSERT INTO doctor (first_name, last_name, specialization, phone, email, dept_id, qualification, experience_years) VALUES
('Sarah', 'Anderson', 'Cardiologist', '555-0201', 'dr.sarah@hospital.com', 1, 'MD, DM Cardiology', 15),
('James', 'Taylor', 'Neurologist', '555-0202', 'dr.james@hospital.com', 2, 'MD, DM Neurology', 12),
('Lisa', 'Martinez', 'Orthopedic Surgeon', '555-0203', 'dr.lisa@hospital.com', 3, 'MS Orthopedics', 10),
('David', 'Garcia', 'Pediatrician', '555-0204', 'dr.david@hospital.com', 4, 'MD Pediatrics', 8),
('Jennifer', 'Lee', 'Dermatologist', '555-0205', 'dr.jennifer@hospital.com', 5, 'MD Dermatology', 6);

-- Seed data for medicines
INSERT INTO medicine (medicine_name, manufacturer, price, stock, expiry_date) VALUES
('Paracetamol', 'PharmaCorp', 5.99, 500, '2027-12-31'),
('Amoxicillin', 'MedLife', 12.50, 300, '2027-06-30'),
('Ibuprofen', 'HealthPlus', 8.75, 450, '2027-09-15'),
('Metformin', 'DiabCare', 15.00, 200, '2027-08-20'),
('Omeprazole', 'GastroMed', 10.25, 350, '2027-11-10'),
('Cetirizine', 'AllerFree', 6.50, 400, '2027-07-25'),
('Aspirin', 'CardioSafe', 4.99, 600, '2028-01-15'),
('Lisinopril', 'BPControl', 18.75, 250, '2027-10-30');

-- Seed data for appointments
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
(1, 1, '2026-04-15', '09:00:00', 'Scheduled', 'Routine heart checkup'),
(2, 2, '2026-04-15', '10:30:00', 'Scheduled', 'Headache and dizziness'),
(3, 3, '2026-04-16', '14:00:00', 'Scheduled', 'Knee pain'),
(4, 4, '2026-04-16', '11:00:00', 'Completed', 'Child vaccination'),
(5, 5, '2026-04-17', '15:30:00', 'Scheduled', 'Skin rash');

-- Seed data for prescriptions
INSERT INTO prescription (patient_id, doctor_id, prescription_date, diagnosis, notes) VALUES
(1, 1, '2026-04-10', 'Mild hypertension', 'Monitor blood pressure daily'),
(2, 2, '2026-04-11', 'Migraine', 'Avoid bright lights, rest well'),
(4, 4, '2026-04-12', 'Common cold', 'Plenty of fluids and rest');

-- Seed data for contains (prescription-medicine)
INSERT INTO `contains` (prescription_id, medicine_id, dosage, duration, frequency) VALUES
(1, 8, '10mg', '30 days', 'Once daily'),
(1, 7, '75mg', '30 days', 'Once daily'),
(2, 1, '500mg', '5 days', 'Twice daily'),
(2, 3, '400mg', '5 days', 'As needed'),
(3, 1, '250mg', '3 days', 'Three times daily'),
(3, 6, '10mg', '5 days', 'Once daily');

-- Seed data for billing
INSERT INTO billing (patient_id, appointment_id, total_amount, payment_status, payment_method, billing_date) VALUES
(1, 1, 1500.00, 'Pending', NULL, '2026-04-15'),
(2, 2, 800.00, 'Paid', 'Credit Card', '2026-04-15'),
(3, 3, 2500.00, 'Pending', NULL, '2026-04-16'),
(4, 4, 350.00, 'Paid', 'Cash', '2026-04-16'),
(5, 5, 600.00, 'Partial', 'UPI', '2026-04-17');
