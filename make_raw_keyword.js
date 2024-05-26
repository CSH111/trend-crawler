import { pr } from "./prismaClient.js";

const refinedKeywords = await pr.refinedKeyword.findMany();
const refinedKeywordsObjs = refinedKeywords.map((rfk) => ({
  ...rfk,
  rawKeywords: Array.from(new Set([rfk.name, rfk.name.toUpperCase(), rfk.name.toLowerCase()])),
}));

try {
  await Promise.all(
    refinedKeywordsObjs.map((ro) => {
      return Promise.all(
        ro.rawKeywords.map((newRk) => {
          return pr.rawKeyword.create({ data: { name: newRk, refined_keyword_id: ro.id } });
        })
      );
    })
  );
} catch {}
