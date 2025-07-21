// import axios from "axios";
// import * as cheerio from "cheerio";
// import { pr } from "../prismaClient";
import { pr } from "../prismaClient.js";

if (!process.argv?.[2]) {
  console.log("리포트 아이디를 인자로입력");
  process.exit();
}
const reportId = process.argv?.[2];
console.log("process.argv: ", process.argv);

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
  // const result = [
  //   { _count: { refined_keyword_id: 1 }, refined_keyword_id: 3796 },
  //   { _count: { refined_keyword_id: 1 }, refined_keyword_id: 4122 },
  // ];
  if (!result.length) {
    return;
  }
  await pr.keyword_counts.createMany({
    data: result.map((d) => {
      return {
        count: d._count.refined_keyword_id,
        refined_keyword_id: d.refined_keyword_id,
        report_date_id: +reportId,
      };
    }),
  });
})();
