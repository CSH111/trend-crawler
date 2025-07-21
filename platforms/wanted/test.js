import axios from "axios";
import * as cheerio from "cheerio";
import { pr } from "../../prismaClient.js";

pr.refined_keywords_on_job_url.findFirst().then((res) => console.log(res));

(async () => {
  const result = await pr.refined_keywords_on_job_url.groupBy({
    by: ["refined_keyword_id"],
    where: {
      job_urls: {
        report_date_id: 2,
      },
    },
    _count: {
      refined_keyword_id: true,
    },
  });
  console.log("result: ", result);
})();
// 1718064000000;

// const targetDate = new Date("2024-06-11");
// const targetEndDate = (targetDate?.getTime() ?? 0) + 3600 * 1000 * 24;

// const urls = await pr.job_urls.findMany({
//   where: { created_at: { gte: targetDate, lt: new Date(targetEndDate) } },
// });
// console.log(urls.length, "----");
// await Promise.all(
//   urls.map((url) => {
//     return pr.url_count_dates.create({ data: { count_date: targetDate, job_url_id: url.id } });
//   })
// );
