import axios from "axios";
import { pr } from "../../prismaClient.js";

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

  const countsToAdd = {};

  rawKeywords.forEach((keyword) => {
    positionDataArr.forEach((pd) => {
      pd.techStacks.some((st) => {
        if (st === keyword.name) {
          if (!countsToAdd[keyword.refined_keyword_id]) {
            countsToAdd[keyword.refined_keyword_id] = {};
            countsToAdd[keyword.refined_keyword_id].count = 1;
            countsToAdd[keyword.refined_keyword_id].urls = [
              `https://www.jumpit.co.kr/position/${pd.id}`,
            ];
            return true;
          }
          countsToAdd[keyword.refined_keyword_id].count += 1;
          countsToAdd[keyword.refined_keyword_id].urls.push(
            `https://www.jumpit.co.kr/position/${pd.id}`
          );
          return true;
        }
      });
    });
  });

  const urlKeyObj = {};

  const countsEntries = Object.entries(countsToAdd);

  countsEntries.forEach(([keywordId, dataObj]) => {
    dataObj.urls.forEach((url) => {
      if (!urlKeyObj[url]) {
        urlKeyObj[url] = [];
      }
      urlKeyObj[url].push(+keywordId);
    });
  });

  // create job url
  await Promise.all(
    Object.entries(urlKeyObj).map(([url, keywordIds]) => {
      return (async () => {
        const existing = await pr.job_urls.findFirst({ where: { url: url } });
        let jobId = existing?.id;
        if (!existing) {
          const newJob = await pr.job_urls.create({
            data: {
              url: url,
              created_at: new Date(),
            },
          });
          jobId = newJob.id;
        }
        try {
          await Promise.all(
            keywordIds.map((kid) => {
              return pr.refined_keywords_on_job_url.create({
                data: { job_url_id: jobId, refined_keyword_id: kid },
              });
            })
          );
        } catch {}
      })();
    })
  );

  // create count
  await Promise.all(
    countsEntries.map(([keywordId, dataObj]) => {
      return (async () => {
        const result = await pr.keyword_counts.findFirst({
          where: { refined_keyword_id: +keywordId },
          orderBy: { id: "desc" },
        });
        if (
          !result ||
          result.created_at.toISOString().split("T")[0] !== new Date().toISOString().split("T")[0]
        ) {
          await pr.keyword_counts.create({
            data: { refined_keyword_id: +keywordId, count: dataObj.count, created_at: new Date() },
          });
          console.log("new count record inserted");
        } else {
          await pr.keyword_counts.update({
            where: { id: result.id },
            data: { count: result.count + dataObj.count },
          });
          console.log("count record updated");
        }
      })();
    })
  );
}
