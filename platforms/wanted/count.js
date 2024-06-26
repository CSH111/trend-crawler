import axios from "axios";
import { pr } from "../../prismaClient.js";
import * as cheerio from "cheerio";

const makeUrl = (page) => {
  return `https://www.wanted.co.kr/api/chaos/navigation/v1/results?${Date.now()}=&job_group_id=518&country=kr&job_sort=job.latest_order&years=-1&locations=all&limit=20&offset=${
    (page - 1) * 20
  }`;
};
console.time("total");
// for (let i = 1; true; i++) {
for (let page = 1; true; page++) {
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
  const jobInfoList = result.data.data.map((d) => {
    return { skillTags: d.skill_tags, jobId: d.id };
  });
  const refinedKeywords = await pr.refined_keywords.findMany({
    where: { is_active: 1 },
    include: { raw_keywords: true, refined_keywords_on_wanted_techs: true },
  });

  // console.log("result.data: ", result.data);

  const countngObj = {};
  const jobUrlObj = {};
  await Promise.all(
    jobInfoList.map(({ jobId, skillTags }) => {
      return (async () => {
        const result = await axios.get(`https://www.wanted.co.kr/wd/${jobId}`);
        const $ = cheerio.load(result.data);
        refinedKeywords.forEach((k) => {
          const needAdd = k.raw_keywords.some((rk) => {
            const isContainSkillTag = k.refined_keywords_on_wanted_techs.some((r) => {
              return skillTags.includes(r.wanted_tech_id);
            });
            if (isContainSkillTag) {
              return true;
            }
            if (rk.no_search_at_html_parse) {
              return false;
            }
            const hasRawKeywordInTargetText = (() => {
              const targetText = $("main > div > div > section").text();
              let regText = rk.name;
              let useReg = false;
              if (rk.prefix_word_ban) {
                useReg = true;
                regText = `[^${rk.prefix_word_ban.split(",").join("|")}]` + regText;
              }
              if (rk.suffix_word_ban) {
                useReg = true;
                regText = regText + `(?!${rk.suffix_word_ban.split(",").join("|")})`;
              }
              if (useReg) {
                const reg = new RegExp(regText);
                if (targetText.search(reg) !== -1) {
                  return true;
                }
                return false;
              } else {
                if (targetText.indexOf(rk.name) !== -1) {
                  return true;
                }
                return false;
              }
            })();
            return hasRawKeywordInTargetText;
          });
          if (!needAdd) {
            return;
          }
          if (!countngObj[k.id]) {
            countngObj[k.id] = 1;
          } else {
            countngObj[k.id] += 1;
          }
          if (!jobUrlObj[jobId]) {
            jobUrlObj[jobId] = new Set();
          }
          jobUrlObj[jobId].add(k.id);
        });
      })();
    })
  );
  // create counts
  await Promise.all(
    Object.entries(countngObj).map(([keywordId, count]) => {
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
            data: { refined_keyword_id: +keywordId, count: count, created_at: new Date() },
          });
          console.log(`new count record inserted. refinedKid(${keywordId})`);
        } else {
          await pr.keyword_counts.update({
            where: { id: result.id },
            data: { count: result.count + count },
          });
          console.log(`count record updated refinedKid(${keywordId})`);
        }
      })();
    })
  );

  // //create job urls
  await Promise.all(
    Object.entries(jobUrlObj).map(([urlId, keywordIdSet]) => {
      const keywordIds = Array.from(keywordIdSet);
      return (async () => {
        let jobUrlDataId;
        const existing = await pr.job_urls.findFirst({
          where: { url: `https://www.wanted.co.kr/wd/${urlId}` },
        });
        if (existing) {
          jobUrlDataId = existing.id;
        } else {
          const newJobUrl = await pr.job_urls.create({
            data: { created_at: new Date(), url: `https://www.wanted.co.kr/wd/${urlId}` },
          });
          jobUrlDataId = newJobUrl.id;
        }
        try {
          await pr.url_count_dates.create({
            data: { job_url_id: jobUrlDataId, count_date: new Date() },
          });
        } catch {}

        await Promise.all(
          keywordIds.map((kid) => {
            return (async () => {
              try {
                await pr.refined_keywords_on_job_url.create({
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
