import axios from "axios";
import { pr } from "../../prismaClient.js";

const apb = "abcdefghijklmnopqrstuvwxyz".split("");

const apbComb = [];
apb.forEach((a1) => {
  apb.forEach((a2) => {
    apb.forEach((a3) => {
      apbComb.push(a1 + a2 + a3);
    });
  });
});
// const newComb = apbComb.slice(4586);
// const newComb2 = newComb.slice(4461);
// const newComb3 = newComb2.slice(4237);

for (let [idx, sk] of apbComb.entries()) {
  console.log(idx, "/", apbComb.length);
  const res = await axios.get(
    `https://www.wanted.co.kr/api/v4/tags/autocomplete?${Date.now()}&kinds=SKILL&keyword=${sk}`
  );
  for (let r of res.data.results) {
    try {
      await pr.wanted_techs.create({ data: { wanted_tech_id: r.id, wanted_name: r.title } });
    } catch {
      continue;
    }
  }
}
