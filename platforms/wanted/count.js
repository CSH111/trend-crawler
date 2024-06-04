import axios from "axios";
import { pr } from "../../prismaClient.js";

const makeUrl = (page) => {
  return `https://www.wanted.co.kr/api/chaos/navigation/v1/results?${Date.now()}=&job_group_id=518&country=kr&job_sort=job.latest_order&years=-1&locations=all&limit=20&offset=${
    (page - 1) * 20
  }`;
};
console.time("total");
// for (let i = 1; true; i++) {
for (let page = 132; true; page++) {
  console.log(`page ${page} started`);
  const url = makeUrl(page);
  const result = await axios.get(url);
  if (result?.data?.data?.length == 0) {
    console.log("last page: ", page);
    break;
  }
  if (page > 5000) {
    console.log("page over 5000");
    break;
  }
  const targetUrlIds = result.data.data.map((d) => d.id);
  const rawKeywords = await pr.rawKeyword.findMany();
  const countngObj = {};
  const jobUrlObj = {};
  await Promise.all(
    targetUrlIds.map((urlId) => {
      return (async () => {
        const result = await axios.get(`https://www.wanted.co.kr/wd/${urlId}`);
        rawKeywords.forEach((k) => {
          const idx = result.data.indexOf(k.name);
          if (idx == -1) {
            return;
          }

          if (!countngObj[k.refined_keyword_id]) {
            countngObj[k.refined_keyword_id] = 1;
          } else {
            countngObj[k.refined_keyword_id] += 1;
          }
          if (!jobUrlObj[urlId]) {
            jobUrlObj[urlId] = new Set();
          }
          jobUrlObj[urlId].add(k.refined_keyword_id);
        });
      })();
    })
  );

  //create counts
  await Promise.all(
    Object.entries(countngObj).map(([keywordId, count]) => {
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
            data: { refined_keyword_id: +keywordId, count: count, created_at: new Date() },
          });
          console.log(`new count record inserted. refinedKid(${keywordId})`);
        } else {
          await pr.keywordCount.update({
            where: { id: result.id },
            data: { count: result.count + count },
          });
          console.log(`count record updated refinedKid(${keywordId})`);
        }
      })();
    })
  );

  //create job urls
  await Promise.all(
    Object.entries(jobUrlObj).map(([urlId, keywordIdSet]) => {
      const keywordIds = Array.from(keywordIdSet);
      return (async () => {
        let jobUrlDataId;
        const existing = await pr.jobUrl.findFirst({
          where: { url: `https://www.wanted.co.kr/wd/${urlId}` },
        });
        if (existing) {
          jobUrlDataId = existing.id;
        } else {
          const newJobUrl = await pr.jobUrl.create({
            data: { created_at: new Date(), url: `https://www.wanted.co.kr/wd/${urlId}` },
          });
          jobUrlDataId = newJobUrl.id;
        }
        await Promise.all(
          keywordIds.map((kid) => {
            return (async () => {
              try {
                await pr.refinedKeywordsOnJobUrl.create({
                  data: { job_url_id: +jobUrlDataId, refined_keyword_id: +kid },
                });
              } catch {}
            })();
          })
        );
      })();
    })
  );
}
console.timeEnd("total");
