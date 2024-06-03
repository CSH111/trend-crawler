/*
  Warnings:

  - A unique constraint covering the columns `[refined_keyword_id,job_url_id]` on the table `refined_keywords_on_job_url` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `refined_keywords_on_job_url_refined_keyword_id_job_url_id_key` ON `refined_keywords_on_job_url`(`refined_keyword_id`, `job_url_id`);
