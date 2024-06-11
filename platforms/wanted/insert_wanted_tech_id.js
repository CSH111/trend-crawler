import axios from "axios";
import { pr } from "../../prismaClient.js";
const rks = await pr.refined_keywords.findMany({ where: { is_active: 1 } });
for (let k of rks) {
  const res = await axios.get(`
  https://www.wanted.co.kr/api/v4/tags/autocomplete?${Date.now()}&kinds=SKILL&keyword=${k.name}`);

  const result = res.data.results;
  if (result.length === 1) {
    try {
      await pr.refined_keywords_on_wanted_techs.create({
        data: { refined_keyword_id: k.id, wanted_tech_id: result[0].id },
      });
    } catch (e) {
      console.log("eee1", e);
    }
  }
}
