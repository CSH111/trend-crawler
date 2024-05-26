import { pr } from "./prismaClient.js";
import axios from "axios";

const groupArr = [
  { num: 1, name: "백엔드", id: 5 },
  { num: 2, name: "프론트엔드", id: 6 },
  { num: 4, name: "모바일", id: 7 },
  { num: 16, name: "모바일", id: 7 },
  { num: 18, name: "모바일", id: 7 },
];

const getJobListUrl = (category, page) => {
  return `https://api.jumpit.co.kr/api/positions?jobCategory=${category}&sort=reg_dt&highlight=false&page=${page}`;
};

const result = await Promise.all(
  groupArr.map((groupObj) => {
    const pages = [1, 2, 3, 4, 5];
    return Promise.all(
      pages.map((p) => {
        return axios.get(getJobListUrl(groupObj.num, p)).then((res) => {
          return res.data.result.positions.map((po) => po.techStacks);
        });
      })
    );
  })
);
const resultWithGroup = result.map((re, idx) => {
  return {
    groupId: groupArr[idx].id,
    result: Array.from(new Set(re.flat().flat())),
  };
});

try {
  await Promise.all(
    resultWithGroup.map((rwg) => {
      return Promise.all(
        rwg.result.map((keyword) => {
          return pr.refinedKeyword.create({
            data: {
              name: keyword,
              is_active: 1,
              keywordGroups: { create: { keywordGroup: { connect: { id: rwg.groupId } } } },
            },
          });
        })
      );
    })
  );
} catch {}

// const res = await axios.get(jobListUrl);
// console.log("res.data: ", res.data.result.positions[0].techStacks);
