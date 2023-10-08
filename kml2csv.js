import { XML } from "https://js.sabae.cc/XML.js";
import { CSV } from "https://js.sabae.cc/CSV.js";
import { GooglePlaceAPI } from "https://code4fukui.github.io/GooglePlaceAPI/GooglePlaceAPI.js";

const kml = await Deno.readTextFile("./doc.kml");
const json = XML.toJSON(kml);
//console.log(json);
const folders = json.kml.Document.Folder;
//console.log(folders);

const array = a => Array.isArray(a) ? a : [a];
/*
cosnt 
  <Document>
    <name>RENEW/2023　参加企業一覧</name>
    <description><![CDATA[タクシー乗降可能場所<br>・RENEW参加企業全94社<br>・うるしの里会館<br>・JR武生駅<br>・福井鉄道たけふ新駅（JR武生駅より徒歩5分）]]></description>
    <Style id="icon-ci-1-normal">
      <IconStyle>
        <scale>1.1</scale>
        <Icon>
          <href>images/icon-1.png</href>
*/
//console.log(json.kml.Document.Style[0])
//Deno.exit(0);

console.log(await GooglePlaceAPI.fetchPosFromName("福井県越前市千福町606-2"));
//Deno.exit(0);

const premap = {
  "shifu.": { lat: 35.8879893, lng: 136.1553524, zoom: 15 },
};


const list = [];
for (const f of folders) {
  const category = f.name["#text"];
  for (const p of array(f.Placemark)) {
    const d = {};
    d.name = p.name["#text"];
    d.category = category;
    const st = p.styleUrl["#text"].substring(1);
    console.log(st)
    const smap = json.kml.Document.StyleMap.find(s => s.id == st).Pair[0].styleUrl["#text"].substring(1);
    d.image = json.kml.Document.Style.find(s => s.id == smap).IconStyle.Icon.href["#text"];
    if (p.Point) {
      console.log(p.Point)
      const ll = p.Point.coordinates["#text"].trim().split(",");
      d.lat = ll[1];
      d.lng = ll[0];
    } else {
      if (premap[d.name]) {
        const pos = premap[d.name];
        d.lat = pos.lat;
        d.lng = pos.lng;
      } else {
        const pos = await GooglePlaceAPI.fetchPosFromName(d.name);
        d.lat = pos.lat;
        d.lng = pos.lng;
        console.log("pos not included", p, "by api", pos);
      }
    }
    d.address = p.name["#text"];
    d.description = p.description["#text"];
    //console.log(p.ExtendedData.Data)
    for (const e of p.ExtendedData.Data) {
      const k = e.name;
      const v = e.value["#text"];
      if (v) {
        d[k] = v;
      }
    }
    list.push(d);
  }
}
await Deno.writeTextFile("renew-2023-map.csv", CSV.stringify(list));
