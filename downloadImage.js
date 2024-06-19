import Axios from "axios";
import Fs from "fs";
import Path from "path";
// console.log("Path.basename: ", Path.basename(Path.resolve(process.cwd())));

export default async function downloadImage(url, path, fileName) {
  try {
    const pathWithName = Path.resolve(path, fileName);
    // axios image download with response type "stream"
    const response = await Axios({
      method: "GET",
      url: url,
      responseType: "stream",
    });

    // pipe the result stream into a file on disc
    try {
      response.data.pipe(Fs.createWriteStream(pathWithName));
    } catch (e) {
      console.log("e", e);
    }

    // return a promise and resolve when download finishes
    return new Promise((resolve, reject) => {
      response.data.on("end", () => {
        resolve();
      });

      response.data.on("error", () => {
        reject();
      });
    });
  } catch (e) {
    console.log("e", e);
  }
}
