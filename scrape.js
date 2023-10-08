import { HTMLParser } from "https://js.sabae.cc/HTMLParser.js";
import { fetchOrLoad } from "https://js.sabae.cc/fetchOrLoad.js";
import { CSV } from "https://js.sabae.cc/CSV.js";

const url = "https://renew-fukui.com/exhibitor/";
const html = await fetchOrLoad(url);
const dom = HTMLParser.parse(html);

const items = dom.querySelectorAll(".exhibitorlist > article");
const links = items.map(i => {
  const a = i.querySelector("a");
  const src = a.getAttribute("href");
  const style = a.getAttribute("style");
  const img = style.substring("background-image: url(".length, style.length - 2);
  const name = i.querySelector(".title").text.trim();
  const tags = i.querySelectorAll(".terms li").map(t => t.text.trim()).join(",");  
  return { name, src, img, tags };
});
console.log(links);
//await Deno.writeTextFile("renew-2023_digest.csv", CSV.stringify(links));

const html2text = (s) => {
  return s.replace(/<br>/g, "\n").trim();
};

for (const i of links) {
  const html = await fetchOrLoad(i.src);
  const dom = HTMLParser.parse(html);

  const parseH5P = (dom, name) => {
    const res = {};
    if (!dom) return res;
    for (const c of dom.childNodes) {
      if (c.tagName == "H5" || (c.tagName == "P" && c.childNodes[0].tagName == "STRONG")) {
        if (c.text.trim()) {
          name = c.text.trim();
        }
      } else if (c.tagName == "P") {
        if (c.text.trim()) {
          res[name] = c.text.trim();
        }
      }
    }
    return res;
  };
  const content = html2text(dom.querySelector(".caption-area .content").text);
  const info1 = parseH5P(dom.querySelector(".caption-area .exhibitor_info"), "会社概要");
  const info2 = parseH5P(dom.querySelector(".caption-area .event_info"), "開催情報");
  Object.assign(i, info2);
  Object.assign(i, info1);
  i.content = content;
}
await Deno.writeTextFile("renew-2023.csv", CSV.stringify(links));
