import axios from "axios";
import * as cheerio from "cheerio";
import FormData2 from "form-data";
const instance = axios.create({
  withCredentials: true,
});

const fd = new FormData2();
fd.append("isDefault", "true");
fd.append(
  "condition[duty]",
  "1000229, 1000230, 1000231, 1000232, 1000235, 1000240, 1000243, 1000242"
);
fd.append("page", "1");
fd.append("order", "20");
fd.append("pagesize", "40");

const listPageResult = await instance.post(
  "https://www.jobkorea.co.kr/Recruit/Home/_GI_List/",
  // {
  //   isDefault: true,
  //   // "condition[duty]": "1000229",
  //   "condition[duty]": "1000229, 1000230, 1000231, 1000232, 1000235, 1000240, 1000243, 1000242",
  //   page: 1,
  //   order: 20,
  //   pagesize: 40,
  // },
  fd,
  {
    headers: {
      Cookie: `PCID=17200232111444454607009; _gcl_au=1.1.233703876.1720023212; _wp_uid=1-40c748bfa50580cce87695ae12bae46d-s1665845194.786264|windows_10|chrome-19314or; M_AdvSrchSaveTipClose=1; ab.storage.deviceId.1da34f1f-4957-4693-a4ef-a262dc6fd88f=%7B%22g%22%3A%2212c97bc8-aa0e-57d8-1e0e-974d216f0d2a%22%2C%22c%22%3A1720023211902%2C%22l%22%3A1720352941554%7D; ab.storage.sessionId.1da34f1f-4957-4693-a4ef-a262dc6fd88f=%7B%22g%22%3A%229585c9fc-14eb-b9a6-7f1b-e9fcf6c9a53a%22%2C%22e%22%3A1720354927918%2C%22c%22%3A1720352941553%2C%22l%22%3A1720353127918%7D; _ga_ZLRVFEG18J=GS1.3.1720352942.3.1.1720353128.60.0.0; CookieNo=2278849456; smenu=menu%5Fortgi=20240708/110619; JKStarter=; StarterRecentMenu=Recent0=1; MainRcntlyData=%3c%6c%69%3e%3c%61%20%68%72%65%66%3d%22%2f%72%65%63%72%75%69%74%2f%68%6f%6d%65%22%3e%c3%a4%bf%eb%c1%a4%ba%b8%3c%2f%61%3e%20%26%67%74%3b%20%3c%61%20%68%72%65%66%3d%22%2f%72%65%63%72%75%69%74%2f%6a%6f%62%6c%69%73%74%3f%6d%65%6e%75%63%6f%64%65%3d%64%75%74%79%22%20%63%6c%61%73%73%3d%22%63%61%74%65%22%3e%c1%f7%b9%ab%ba%b0%3c%2f%61%3e%3c%2f%6c%69%3e%7c%24%24%7c; TS_RecentKeyword=%7B%22IsAutoSave%22%3Atrue%2C%22RecentKeywordList%22%3A%5B%22%uCF00%uC774%uC5D0%uC774%uC528%uBBF8%uB514%uC5B4%uADF8%uB8F9%22%2C%22%uCF00%uC774%uC5D0%uC774%uC528%uBBF8%uB514%uC5B4%uADF8%uB8F9%22%2C%22%uCF00%uC774%uC5D0%uC774%uC528%uBBF8%uB514%uC5B4%uADF8%uB8F9%22%2C%22%uC5D0%uC774%uCE58%uBE44%uC5E0%uD53C%22%5D%7D; CookieNo=2278849456; ASP.NET_SessionId=4p5apehca0fa2pggcnbakgxo; jobkorea=Site_Oem_Code=C1; WMONID=QRWCQYqGvRc; DSIF=google; GTMVars=b86daa8f8a80f8bb68260b0930f45617; _gid=GA1.3.1921730985.1721162630; ECHO_SESSION=4971721162637982; Main_Top_Banner_Seq=1; _ga_Y8D38WJBKH=GS1.3.1721163428.4.0.1721163428.60.0.0; RSCondition=[{"CookieIndex":"20240717061503","Cndt_No":0,"M_Id":"","Jobtype_Code":"1000229,1000230,1000231,1000232,1000235,1000240,1000243,1000242","Reg_Dt":"2024-07-17T06:15:03.9224329+09:00","IsKeep":true},{"CookieIndex":"20240717061016","Cndt_No":0,"M_Id":"","Jobtype_Code":"1000229,1000230,1000231,1000232,1000236,1000237,1000239,1000235,1000240,1000243,1000242","Reg_Dt":"2024-07-17T06:10:16.5243803+09:00","IsKeep":true},{"CookieIndex":"20240717060923","Cndt_No":0,"M_Id":"","Jobtype_Code":"1000229,1000230,1000231,1000232,1000239,1000240,1000243,1000244,1000242,1000235,1000236,1000237","Word_Inc":"ë³¸ë¼ì¸","Reg_Dt":"2024-07-17T06:09:23.557845+09:00","IsKeep":true},{"CookieIndex":"20240717054742","Cndt_No":0,"M_Id":"","Jobtype_Code":"1000229,1000230,1000231,1000232,1000239,1000240,1000243,1000244,1000242,1000235,1000236,1000237","Reg_Dt":"2024-07-17T05:47:42.5217445+09:00","IsKeep":true},{"CookieIndex":"20240717054532","Cndt_No":0,"M_Id":"","Jobtype_Code":"1000229,1000230,1000231,1000232","Reg_Dt":"2024-07-17T05:45:32.0114439+09:00","IsKeep":true}]; GTMVarsFrom=NET:06:16:01; _ga_GQWHSF87P4=GS1.1.1721162628.10.1.1721164561.54.0.0; _ga=GA1.3.941271498.1720023213; _ga_H72LM07GXG=GS1.3.1721162629.5.1.1721164561.60.0.0; cto_bundle=BMzPQV9ycGFYRTJGN01qRDdOV3htMnU5JTJCb2VOY3F6d3VENmFIVmFBJTJCMWVzSWxiT3dvYyUyRm85dGQ0cXl6WHVGYUNaT210aVQybTlDQUtXTXltQlBvTVNoNyUyRmRxT1NrTjZuUm1wdll6Tk1wbyUyRlBoM2xUWjlkbk9TV2FtaGR2dmklMkZhaXVDcmVvOHVsVmFTT2ZDdUN2TFZqdkxld294bHowelBVRzclMkJHd3ZnWkY5Qm1ZJTJCd01DdHdTR0x5bEdlaGljcVN6dmd4R3NxNDNtbWdKJTJGN3AlMkZ5SjhGdGdjVmclM0QlM0Q`,
      // Cookie: "aa=123",
      "X-Requested-With": "XMLHttpRequest",
    },
  }
);

const $ = cheerio.load(listPageResult.data);

const zz = $.text();
console.log("zz: ", zz);

// $("td.tplTit a").each((s, e) => {
//   const zzz = $(e).attr("href");
//   console.log(s);
//   console.log("zzz: ", zzz);
//   // var link = $(s).attr("href");
//   // console.log("link: ", link);
// });
