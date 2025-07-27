import axios from "axios";
import { pr } from "../../prismaClient.js";

if (!process.argv?.[2]) {
  console.log("리포트 아이디를 인자로입력");
  process.exit();
}
console.log("process.argv: ", process.argv);
const reportId = Number(process.argv?.[2]);
if (!reportId) {
  console.log("리포트 아이디 형태 오류로 실행종료", "reportId:", reportId);
  process.exit();
}

const rawKeywords = await pr.raw_keywords.findMany({
  where: { refined_keywords: { is_active: 1 } },
});

const makeUrlWithPage = (pageN) => {
  return `https://api.jumpit.co.kr/api/positions?jobCategory=2&jobCategory=3&jobCategory=4&jobCategory=16&jobCategory=18&jobCategory=16&jobCategory=6&jobCategory=7&jobCategory=19&jobCategory=8&jobCategory=9&jobCategory=22&sort=reg_dt&highlight=false&page=${pageN}`;
};

const res = await axios.get(makeUrlWithPage(1));
const jobsCount = res.data.result.totalCount;
const pagesToSearch = Array(Math.ceil(jobsCount / 16))
  .fill()
  .map((_, i) => i + 1);

// for (let pageNumber of pagesToSearch) {
for (let pageNumber = 1; 1; pageNumber++) {
  console.log(`${pageNumber} page started`);
  const getListApiUrl = makeUrlWithPage(pageNumber);
  const res = await axios.get(getListApiUrl);
  const positionDataArr = res.data.result.positions;
  if (positionDataArr.length < 1) {
    console.log(`search ended at page ${pageNumber}`);
    break;
  }

  // if (pageNumber > 1) {
  //   console.log("stop");
  //   break;
  // }

  const countsToAdd = {};

  await Promise.allSettled(
    positionDataArr.map(async (pd) => {
      try {
        const urlData = await pr.job_urls.create({
          data: {
            url: `https://www.jumpit.co.kr/position/${pd.id}`,
            platform_id: 3,
            report_date_id: +reportId,
          },
        });

        const urlId = urlData.id;
        const rkIdsToInsert = new Set();
        rawKeywords.forEach((keyword) => {
          pd.techStacks.some((st) => {
            if (st === keyword.name) {
              // TODO: 접두 접미 금칙어 적용
              rkIdsToInsert.add(keyword.refined_keyword_id);
              return true;
            }
          });
        });
        await pr.refined_keywords_on_job_url.createMany({
          skipDuplicates: true,
          data: Array.from(rkIdsToInsert).map((rkId) => {
            return { job_url_id: urlId, refined_keyword_id: rkId };
          }),
        });
      } catch (e) {
        console.log("e: ", e);
        return;
      }
    })
  );

  // rawKeywords.forEach((keyword) => {
  //   positionDataArr.forEach(async (pd) => {
  //     pd.techStacks.some((st) => {
  //       if (st === keyword.name) {
  //         if (!countsToAdd[keyword.refined_keyword_id]) {
  //           countsToAdd[keyword.refined_keyword_id] = {};
  //           countsToAdd[keyword.refined_keyword_id].count = 1;
  //           countsToAdd[keyword.refined_keyword_id].urls = [
  //             `https://www.jumpit.co.kr/position/${pd.id}`,
  //           ];
  //           return true;
  //         }
  //         countsToAdd[keyword.refined_keyword_id].count += 1;
  //         countsToAdd[keyword.refined_keyword_id].urls.push(
  //           `https://www.jumpit.co.kr/position/${pd.id}`
  //         );
  //         return true;
  //       }
  //     });
  //   });
  // });

  // const urlKeyObj = {};

  // const countsEntries = Object.entries(countsToAdd);

  // countsEntries.forEach(([keywordId, dataObj]) => {
  //   dataObj.urls.forEach((url) => {
  //     if (!urlKeyObj[url]) {
  //       urlKeyObj[url] = [];
  //     }
  //     urlKeyObj[url].push(+keywordId);
  //   });
  // });
  // console.log("countsToAdd: ", countsToAdd);
  // console.log("countsEntries: ", countsEntries);

  // await pr.job;

  // create job url
  // await Promise.all(
  //   Object.entries(urlKeyObj).map(([url, keywordIds]) => {
  //     return (async () => {
  //       const existing = await pr.job_urls.findFirst({ where: { url: url } });
  //       let jobId = existing?.id;
  //       if (!existing) {
  //         const newJob = await pr.job_urls.create({
  //           data: {
  //             platform_id: 3,
  //             url: url,
  //             created_at: new Date(),
  //           },
  //         });
  //         jobId = newJob.id;
  //       }
  //       try {
  //         await pr.url_count_dates.create({ data: { job_url_id: jobId, count_date: new Date() } });
  //       } catch {}
  //       try {
  //         await Promise.all(
  //           keywordIds.map((kid) => {
  //             return pr.refined_keywords_on_job_url.create({
  //               data: { job_url_id: jobId, refined_keyword_id: kid },
  //             });
  //           })
  //         );
  //       } catch {}
  //     })();
  //   })
  // );

  // // create count
  // await Promise.all(
  //   countsEntries.map(([keywordId, dataObj]) => {
  //     return (async () => {
  //       const result = await pr.keyword_counts.findFirst({
  //         where: { refined_keyword_id: +keywordId },
  //         orderBy: { id: "desc" },
  //       });
  //       if (
  //         !result ||
  //         result.created_at.toISOString().split("T")[0] !== new Date().toISOString().split("T")[0]
  //       ) {
  //         await pr.keyword_counts.create({
  //           data: { refined_keyword_id: +keywordId, count: dataObj.count, created_at: new Date() },
  //         });
  //         console.log("new count record inserted");
  //       } else {
  //         await pr.keyword_counts.update({
  //           where: { id: result.id },
  //           data: { count: result.count + dataObj.count },
  //         });
  //         console.log("count record updated");
  //       }
  //     })();
  //   })
  // );
}
