-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `document` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_seller` BOOLEAN NOT NULL DEFAULT false,
    `amount` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `recipient_id` INTEGER NULL,
    `user_alteration` VARCHAR(255) NULL,
    `log_type` VARCHAR(50) NULL,
    `description` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `transaction_id` VARCHAR(255) NULL,
    `original_transaction_id` VARCHAR(255) NULL,
    `previous_balance` DECIMAL(10, 2) NULL,
    `new_balance` DECIMAL(10, 2) NULL,
    `ip_address` VARCHAR(45) NULL,
    `device_info` VARCHAR(255) NULL,
    `status` VARCHAR(50) NULL,
    `notes` VARCHAR(191) NULL,
    `transaction_amount` DECIMAL(10, 2) NULL,
    `recipient_previous_balance` DECIMAL(10, 2) NULL,
    `recipient_new_balance` DECIMAL(10, 2) NULL,

    UNIQUE INDEX `Log_transaction_id_key`(`transaction_id`),
    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
