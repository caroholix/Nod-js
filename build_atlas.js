// build_atlas.js
import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";

const emojiDir = "./sprite"; // folder containing SVG emojis
const outputDir = "./atlas_output";
const tileSize = 64;
const atlasSize = 4096;

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

async function buildAtlas() {
  const files = fs.readdirSync(emojiDir).filter(f => f.endsWith(".svg"));
  const perRow = atlasSize / tileSize;
  const perAtlas = perRow * perRow;

  let atlasIndex = 0;
  let map = {};
  let canvas = createCanvas(atlasSize, atlasSize);
  let ctx = canvas.getContext("2d");
  let count = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const img = await loadImage(path.join(emojiDir, file));
    const col = count % perRow;
    const row = Math.floor(count / perRow);
    ctx.drawImage(img, col * tileSize, row * tileSize, tileSize, tileSize);

    map[file.replace(".svg", "")] = {
      atlas: atlasIndex,
      x: col * tileSize,
      y: row * tileSize,
      w: tileSize,
      h: tileSize
    };

    count++;
    if (count >= perAtlas || i === files.length - 1) {
      const out = path.join(outputDir, `atlas-${atlasIndex}.png`);
      const stream = fs.createWriteStream(out);
      const png = canvas.createPNGStream();
      png.pipe(stream);
      console.log(`🟢 Saved ${out}`);

      atlasIndex++;
      canvas = createCanvas(atlasSize, atlasSize);
      ctx = canvas.getContext("2d");
      count = 0;
    }
  }

  fs.writeFileSync(path.join(outputDir, "atlas-map.json"), JSON.stringify(map, null, 2));
  console.log("✅ Atlas map saved.");
}

buildAtlas().catch(console.error);