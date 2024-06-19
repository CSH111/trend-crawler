import downLoadImg from "./downloadImage.js";
import path from "path";
import axios from "axios";
import { pr } from "./prismaClient.js";
const targetPath = path.resolve(path.resolve(process.cwd()), "images");
const targetApiUrl = "https://api.jumpit.co.kr/api/tech-stacks?name=";

const keywords = await pr.refined_keywords.findMany();

for (let keyword of keywords) {
  const res = await axios.get(targetApiUrl + keyword.name);
  if (res.data.result?.[0]) {
    const imgSource = res.data.result[0].imagePath;
    const oriImgName = imgSource.split("/").pop();
    if (oriImgName.startsWith("noStack")) {
      console.log("no stack image");
      continue;
    }
    const extName = oriImgName.split(".").pop();
    try {
      await downLoadImg(
        imgSource,
        targetPath,
        `${keyword.name.replaceAll("/", "-").replaceAll(" ", "-")}.${extName}`
      );
    } catch (e) {
      console.log("download failed~ on", keyword.name);
      console.log(e);
      continue;
    }
  } else {
    console.log("!!!!!!!!! no result on", keyword);
  }
}
