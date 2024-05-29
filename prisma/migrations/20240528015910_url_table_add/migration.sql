/*
  Warnings:

  - You are about to drop the column `createdAt` on the `keyword_counts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `keyword_counts` DROP COLUMN `createdAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `job_urls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `job_urls_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refined_keywords_on_job_url` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `refined_keyword_id` INTEGER NOT NULL,
    `job_url_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refined_keywords_on_job_url` ADD CONSTRAINT `refined_keywords_on_job_url_refined_keyword_id_fkey` FOREIGN KEY (`refined_keyword_id`) REFERENCES `refined_keywords`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refined_keywords_on_job_url` ADD CONSTRAINT `refined_keywords_on_job_url_job_url_id_fkey` FOREIGN KEY (`job_url_id`) REFERENCES `job_urls`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
