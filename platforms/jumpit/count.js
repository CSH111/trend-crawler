import axios from "axios";
import { pr } from "../../prismaClient.js";

const rawKeywords = await pr.rawKeyword.findMany();
const platformId = 1;
const platformData = await pr.platform.findFirst({ where: { id: platformId } });
const lastId = +platformData.last_id;
let newLastId;
const pagesToSearch = Array(10)
  .fill()
  .map((_, i) => i + 1);
// const pagesToSearch = [1, 2];

const makeUrlWithPage = (pageN) => {
  return `https://api.jumpit.co.kr/api/positions?jobCategory=1&jobCategory=2&jobCategory=3&jobCategory=4&jobCategory=16&sort=reg_dt&highlight=false&page=${pageN}`;
};

for (let pageNumber of pagesToSearch) {
  const getListApiUrl = makeUrlWithPage(pageNumber);
  const res = await axios.get(getListApiUrl);
  const positionDataArr = res.data.result.positions.filter((pd) => {
    return +pd.id > lastId;
  });
  if (positionDataArr.length < 1) {
    break;
  }

  if (pageNumber === pagesToSearch[0]) {
    newLastId = positionDataArr?.[0]?.id;
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
        const existing = await pr.jobUrl.findFirst({ where: { url: url } });
        let jobId = existing?.id;
        if (!existing) {
          const newJob = await pr.jobUrl.create({
            data: {
              url: url,
              created_at: new Date(),
            },
          });
          jobId = newJob.id;
        }
        await pr.refinedKeywordsOnJobUrl.createMany({
          data: keywordIds.map((kid) => {
            return { job_url_id: jobId, refined_keyword_id: kid };
          }),
        });
      })();
    })
  );

  // create count
  await Promise.all(
    countsEntries.map(([keywordId, dataObj]) => {
      return (async () => {
        const result = await pr.keywordCount.findFirst({
          where: { refined_keyword_id: +keywordId },
          orderBy: { id: "desc" },
        });
        if (
          !result ||
          result.created_at.toISOString().split("T")[0] !== new Date().toISOString().split("T")[0]
        ) {
          await pr.keywordCount.create({
            data: { refined_keyword_id: +keywordId, count: dataObj.count, created_at: new Date() },
          });
          console.log("new count record inserted");
        } else {
          await pr.keywordCount.update({
            where: { id: result.id },
            data: { count: result.count + dataObj.count },
          });
          console.log("count record updated");
        }
      })();
    })
  );
}

if (newLastId) {
  await pr.platform.update({
    where: { id: platformId },
    data: { last_id: String(newLastId), updated_at: new Date() },
  });
} else {
  console.log("no new job!");
}
