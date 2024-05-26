/*
  Warnings:

  - Added the required column `name2` to the `raw_keywords` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `raw_keywords` ADD COLUMN `name2` VARCHAR(20) NOT NULL;
