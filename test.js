import { pr } from "./prismaClient.js";

const data = [
  { job_url_id: 1, refined_keyword_id: 2164 },
  { job_url_id: 1, refined_keyword_id: 2164 },
  { job_url_id: 2, refined_keyword_id: 2707 },
  { job_url_id: 3, refined_keyword_id: 2707 },
];
try {
  await Promise.all(
    data.map((d) => {
      return pr.refinedKeywordsOnJobUrl.create({ data: d });
    })
  );
} catch {}
