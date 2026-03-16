-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 16, 2026 at 11:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sahayak`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbladmins`
--

CREATE TABLE `tbladmins` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_img` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbladmins`
--

INSERT INTO `tbladmins` (`id`, `name`, `email`, `password`, `created_at`, `profile_img`) VALUES
(1, 'Super Admin', 'admin@sahayak.com', '$2y$10$fIRralErtgLBJ57qomMSSuSXJSgLvA3SelHywZrbgFM3Ga1TojQci', '2026-03-16 06:40:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tblbookings`
--

CREATE TABLE `tblbookings` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `visit_charge` decimal(10,2) DEFAULT 99.00,
  `final_amount` decimal(10,2) DEFAULT 0.00,
  `bill_description` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `booking_date` date NOT NULL,
  `time_slot` varchar(20) NOT NULL,
  `status` enum('pending','confirmed','started','payment_pending','completed','cancelled') DEFAULT 'pending',
  `address` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblbookings`
--

INSERT INTO `tblbookings` (`id`, `customer_id`, `provider_id`, `service_id`, `visit_charge`, `final_amount`, `bill_description`, `rejection_reason`, `booking_date`, `time_slot`, `status`, `address`, `created_at`, `completed_at`, `cancelled_at`) VALUES
(1, 4, 2, 3, 99.00, 0.00, NULL, NULL, '2025-12-03', '06:00 PM', 'cancelled', 'surat', '2025-12-03 10:27:33', NULL, NULL),
(2, 4, 1, 1, 99.00, 0.00, NULL, NULL, '2025-12-04', '04:00 PM', 'cancelled', 'surat', '2025-12-03 10:55:01', NULL, NULL),
(3, 4, 2, 3, 99.00, 0.00, NULL, NULL, '2025-12-10', '09:00 AM', 'cancelled', 'jahangirpura', '2025-12-08 09:36:07', NULL, '2025-12-08 17:43:09'),
(4, 4, 4, 13, 99.00, 300.00, 'hii', NULL, '2026-01-02', '11:00 AM', 'completed', 'nfhnd', '2025-12-08 10:26:35', NULL, NULL),
(5, 4, 4, 13, 99.00, 0.00, NULL, NULL, '2025-12-11', '09:00 AM', 'cancelled', '97 jjhfg', '2025-12-08 10:42:10', NULL, NULL),
(6, 4, 4, 13, 99.00, 99.00, 'hi [Customer Rejected Work]', 'over-charge', '2025-12-11', '04:00 PM', 'completed', 'jfgj', '2025-12-08 10:42:49', NULL, NULL),
(7, 4, 4, 13, 99.00, 99.00, 'hd [Customer Rejected]', 'no', '2025-12-12', '09:00 AM', 'completed', 'fs', '2025-12-08 11:03:21', '2025-12-08 16:34:06', NULL),
(8, 4, 2, 3, 99.00, 0.00, NULL, NULL, '2025-12-09', '09:00 AM - 11:00 AM', 'pending', 'J-808, suman vandhan near sai pujan, jahangirpura', '2025-12-08 14:16:41', NULL, NULL),
(9, 4, 6, 15, 99.00, 0.00, NULL, NULL, '2025-12-11', '09:00 AM - 11:00 AM', 'completed', 'J-808, suman vandhan near sai pujan, jahangirpura', '2025-12-09 10:54:14', NULL, NULL),
(10, 4, 4, 13, 99.00, 200.00, 'dfg', NULL, '2025-12-11', '09:00 AM - 11:00 AM', 'payment_pending', 'J-808, suman vandhan near sai pujan, jahangirpura', '2025-12-10 09:30:43', NULL, NULL),
(11, 4, 4, 16, 99.00, 500.00, 'changed Tap', NULL, '2026-03-20', '09:00 AM - 11:00 AM', 'completed', 'J-808, suman vandhan near sai pujan, jahangirpura', '2026-03-16 08:34:30', '2026-03-16 15:03:57', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tblcategories`
--

CREATE TABLE `tblcategories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblcategories`
--

INSERT INTO `tblcategories` (`id`, `name`, `slug`, `image`) VALUES
(1, 'Plumber', 'plumber', 'plumber.png'),
(2, 'Electrician', 'electrician', 'electrician.png'),
(3, 'Cleaning', 'cleaning', 'cleaning.png'),
(5, 'Carpenter', 'carpenter', 'carpenter.png'),
(6, 'AC Repair', 'ac-repair', 'ac-repair.png'),
(7, 'Tutor', 'tutor', '/uploads/categories/tutor_1773644897.png');

-- --------------------------------------------------------

--
-- Table structure for table `tblcustomers`
--

CREATE TABLE `tblcustomers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text DEFAULT NULL,
  `locality` varchar(255) DEFAULT NULL,
  `profile_img` varchar(255) DEFAULT 'default_user.png',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblcustomers`
--

INSERT INTO `tblcustomers` (`id`, `name`, `email`, `password`, `phone`, `address`, `locality`, `profile_img`, `created_at`) VALUES
(1, 'Ravi Patel', 'ravi@gmail.com', '$2y$10$Tw.v.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', '9876500001', 'B-201, Rajhans Point, Adajan, Surat', NULL, 'default_user.png', '2025-12-01 07:32:31'),
(2, 'Sneha Desai', 'sneha@gmail.com', '$2y$10$Tw.v.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', '9876500002', 'A-405, Vesu VIP Road, Surat', NULL, 'default_user.png', '2025-12-01 07:32:31'),
(3, 'Amit Shah', 'amit@gmail.com', '$2y$10$Tw.v.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', '9876500003', 'C-12, Pal Gam, Surat', NULL, 'default_user.png', '2025-12-01 07:32:31'),
(4, 'vinay', 'vinay@a.com', '$2y$10$iwhz0VQVMUWvQONG0pGrtOi56833mDFjV5GCZ2.JaBaqumnYB32Zq', '7985337963', 'J-808, suman vandhan near sai pujan, jahangirpura', 'Surat', 'uploads/user_4_1773654139.jpg', '2025-12-01 10:10:06'),
(6, 'shivam', 'shiv@m.com', '$2y$10$EtOzDy7YvGN8D8Ecj4fEU.5ZvDXruMBuOSfIyxIAnIj6WPCObIT46', '7878787878', '10, majura, Adajan, Surat', 'Adajan', 'default_user.png', '2025-12-02 08:43:45');

-- --------------------------------------------------------

--
-- Table structure for table `tblcustomer_addresses`
--

CREATE TABLE `tblcustomer_addresses` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `label` varchar(50) DEFAULT NULL,
  `address` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblcustomer_addresses`
--

INSERT INTO `tblcustomer_addresses` (`id`, `customer_id`, `label`, `address`, `created_at`) VALUES
(1, 4, 'Home', 'J-808, suman vandhan near sai pujan, jahangirpura', '2025-12-08 13:42:34');

-- --------------------------------------------------------

--
-- Table structure for table `tblproviders`
--

CREATE TABLE `tblproviders` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(50) NOT NULL,
  `bio` text DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `profile_img` varchar(255) DEFAULT 'default_provider.png',
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblproviders`
--

INSERT INTO `tblproviders` (`id`, `name`, `email`, `password`, `phone`, `address`, `city`, `bio`, `profession`, `experience_years`, `profile_img`, `is_verified`, `created_at`) VALUES
(1, 'Raju Mistry', 'rajesh@gmail.com', '$2y$10$Tw.v.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', '9898011111', NULL, 'Surat', 'Expert Plumber with 10 years of experience in pipe fitting and leakage.', NULL, 10, 'default_provider.png', 0, '2025-12-01 07:34:17'),
(2, 'Sunita Cleaning', 'sunita@gmail.com', '$2y$10$Tw.v.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', '9898022222', NULL, 'Surat', 'Professional home deep cleaning and sofa cleaning services.', NULL, 5, '../images/cleaner.png', 1, '2025-12-01 07:34:17'),
(3, 'Vijay Electricals', 'vijay@gmail.com', '$2y$10$Tw.v.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', '9898033333', NULL, 'Surat', 'AC Repair and House Wiring specialist. Available 24/7.', NULL, 8, 'default_provider.png', 0, '2025-12-01 07:34:17'),
(4, 'Ranjan kumar', 'ranjan@abc.com', '$2y$10$uVYvPS1a/ZZkB/Z26ZushuSLzVCsfzCjLBr0650PXjs2PxbfPKsm2', '9876543210', 'A-808 jahangirpura', 'Surat', '', 'Electrician', 5, '/uploads/profiles/provider_4_1773642344.png', 1, '2025-12-05 10:12:08'),
(5, 'nilesh gond', 'nilesh@gond.com', '$2y$10$CYrXrHpM56NY8zuqRlvRQ.EM7HVJ1ODm9h33aZDuaGKZO4xicW9oG', '1235987634', 'adajan', 'Surat', 'Expert AC repairing.', 'AC Repair', 2, 'default_provider.png', 0, '2025-12-09 09:56:55'),
(6, 'raman', 'raman@a.c', '$2y$10$yicBnolXs8NABzeN2NvciuDYSlTg61ibwKxEKyqaM7kPgtR8QmT0y', '78984560123', 'adajan', 'Surat', 'Expert carpenter', 'Carpenter', 2, 'default_provider.png', 0, '2025-12-09 10:01:38');

-- --------------------------------------------------------

--
-- Table structure for table `tblprovider_services`
--

CREATE TABLE `tblprovider_services` (
  `id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `service_name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price_per_hour` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblprovider_services`
--

INSERT INTO `tblprovider_services` (`id`, `provider_id`, `category_id`, `service_name`, `description`, `price_per_hour`) VALUES
(1, 1, 1, 'Tap Leakage Repair', 'Fixing dripping taps and valves.', 200.00),
(2, 1, 1, 'Water Tank Installation', 'Full installation of 500L/1000L tanks.', 1500.00),
(3, 2, 3, 'Full Home Deep Cleaning', 'Includes floor, kitchen, and washroom cleaning.', 999.00),
(4, 3, 2, 'Fan & Light Installation', 'Installing new ceiling fans and tubelights.', 150.00),
(5, 3, 2, 'AC Gas Filling', 'Split AC gas refilling and servicing.', 2500.00),
(13, 4, 1, 'nnxnxb', 'fghhf', 754.00),
(15, 6, 5, 'furniture', 'all', 200.00),
(16, 4, 1, 'Tap Repair', 'Tap fixing', 399.00);

-- --------------------------------------------------------

--
-- Table structure for table `tblreviews`
--

CREATE TABLE `tblreviews` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbltransactions`
--

CREATE TABLE `tbltransactions` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `admin_commission` decimal(10,2) NOT NULL,
  `provider_earnings` decimal(10,2) NOT NULL,
  `payment_status` enum('paid','refunded') DEFAULT 'paid',
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbltransactions`
--

INSERT INTO `tbltransactions` (`id`, `booking_id`, `total_amount`, `admin_commission`, `provider_earnings`, `payment_status`, `transaction_date`) VALUES
(1, 4, 300.00, 30.00, 270.00, 'paid', '2025-12-08 10:36:43'),
(2, 11, 500.00, 50.00, 450.00, 'paid', '2026-03-16 09:33:57');

-- --------------------------------------------------------

--
-- Table structure for table `tblwithdrawals`
--

CREATE TABLE `tblwithdrawals` (
  `id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblwithdrawals`
--

INSERT INTO `tblwithdrawals` (`id`, `provider_id`, `amount`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 500.00, 'pending', '2026-03-16 10:18:43', '2026-03-16 10:18:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbladmins`
--
ALTER TABLE `tbladmins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tblbookings`
--
ALTER TABLE `tblbookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `provider_id` (`provider_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `tblcategories`
--
ALTER TABLE `tblcategories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tblcustomers`
--
ALTER TABLE `tblcustomers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tblcustomer_addresses`
--
ALTER TABLE `tblcustomer_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `tblproviders`
--
ALTER TABLE `tblproviders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tblprovider_services`
--
ALTER TABLE `tblprovider_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `provider_id` (`provider_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `tblreviews`
--
ALTER TABLE `tblreviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `tbltransactions`
--
ALTER TABLE `tbltransactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `tblwithdrawals`
--
ALTER TABLE `tblwithdrawals`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbladmins`
--
ALTER TABLE `tbladmins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tblbookings`
--
ALTER TABLE `tblbookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tblcategories`
--
ALTER TABLE `tblcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tblcustomers`
--
ALTER TABLE `tblcustomers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tblcustomer_addresses`
--
ALTER TABLE `tblcustomer_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tblproviders`
--
ALTER TABLE `tblproviders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tblprovider_services`
--
ALTER TABLE `tblprovider_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tblreviews`
--
ALTER TABLE `tblreviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbltransactions`
--
ALTER TABLE `tbltransactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblwithdrawals`
--
ALTER TABLE `tblwithdrawals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tblbookings`
--
ALTER TABLE `tblbookings`
  ADD CONSTRAINT `tblbookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `tblcustomers` (`id`),
  ADD CONSTRAINT `tblbookings_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `tblproviders` (`id`),
  ADD CONSTRAINT `tblbookings_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `tblprovider_services` (`id`);

--
-- Constraints for table `tblcustomer_addresses`
--
ALTER TABLE `tblcustomer_addresses`
  ADD CONSTRAINT `tblcustomer_addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `tblcustomers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tblprovider_services`
--
ALTER TABLE `tblprovider_services`
  ADD CONSTRAINT `tblprovider_services_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `tblproviders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tblprovider_services_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `tblcategories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tblreviews`
--
ALTER TABLE `tblreviews`
  ADD CONSTRAINT `tblreviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `tblbookings` (`id`),
  ADD CONSTRAINT `tblreviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `tblcustomers` (`id`),
  ADD CONSTRAINT `tblreviews_ibfk_3` FOREIGN KEY (`provider_id`) REFERENCES `tblproviders` (`id`);

--
-- Constraints for table `tbltransactions`
--
ALTER TABLE `tbltransactions`
  ADD CONSTRAINT `tbltransactions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `tblbookings` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
