import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'sbti_images');
const outDir = path.join(projectRoot, 'public', 'images', 'results');

const TARGET_BYTES = Number(process.env.TARGET_IMAGE_BYTES ?? 50 * 1024);
const MAX_WIDTH = Number(process.env.MAX_IMAGE_WIDTH ?? 1200);
const MIN_WIDTH = Number(process.env.MIN_IMAGE_WIDTH ?? 520);
const QUALITY_STEPS = [88, 84, 80, 76, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36, 32];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listSourceImages(dir) {
  const entries = await fs.readdir(dir);
  return entries.filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
}

async function listOutputImages(dir) {
  const entries = await fs.readdir(dir);
  return entries.filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
}

async function fileSize(filePath) {
  const st = await fs.stat(filePath);
  return st.size;
}

async function encodeWebp(srcPath, width, quality) {
  const buffer = await sharp(srcPath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();
  return { buffer, size: buffer.length };
}

async function optimizeToTarget(srcPath) {
  const metadata = await sharp(srcPath).metadata();
  let width = Math.min(metadata.width ?? MAX_WIDTH, MAX_WIDTH);
  let best = null;

  for (let widthAttempt = 0; widthAttempt < 8; widthAttempt += 1) {
    let bestUnderTarget = null;

    for (const quality of QUALITY_STEPS) {
      const encoded = await encodeWebp(srcPath, width, quality);
      const candidate = { ...encoded, quality, width };

      if (!best || candidate.size < best.size) {
        best = candidate;
      }

      if (candidate.size <= TARGET_BYTES) {
        bestUnderTarget = candidate;
        break;
      }
    }

    if (bestUnderTarget) {
      return { ...bestUnderTarget, hitTarget: true };
    }

    const nextWidth = Math.floor(width * 0.88);
    if (nextWidth >= width || nextWidth < MIN_WIDTH) {
      break;
    }
    width = nextWidth;
  }

  return {
    ...best,
    hitTarget: Boolean(best && best.size <= TARGET_BYTES),
  };
}

async function run() {
  await ensureDir(outDir);

  const staleOutputs = await listOutputImages(outDir);
  await Promise.all(staleOutputs.map((file) => fs.unlink(path.join(outDir, file))));

  const files = await listSourceImages(srcDir);
  const rows = [];

  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const outFile = `${file.replace(/\.[^.]+$/, '')}.webp`;
    const outPath = path.join(outDir, outFile);

    const oldSize = await fileSize(srcPath);
    const optimized = await optimizeToTarget(srcPath);
    await fs.writeFile(outPath, optimized.buffer);

    const newSize = await fileSize(outPath);
    const saved = oldSize - newSize;
    const ratio = oldSize ? ((saved / oldSize) * 100).toFixed(2) : '0.00';

    rows.push({
      sourceFile: file,
      outputFile: outFile,
      oldSize,
      newSize,
      saved,
      ratio: `${ratio}%`,
      targetBytes: TARGET_BYTES,
      hitTarget: newSize <= TARGET_BYTES,
      quality: optimized.quality,
      width: optimized.width,
    });
  }

  const totalOld = rows.reduce((s, r) => s + r.oldSize, 0);
  const totalNew = rows.reduce((s, r) => s + r.newSize, 0);
  const totalSaved = totalOld - totalNew;
  const totalRatio = totalOld ? ((totalSaved / totalOld) * 100).toFixed(2) : '0.00';
  const targetHitCount = rows.filter((r) => r.hitTarget).length;

  const report = {
    generatedAt: new Date().toISOString(),
    targetBytes: TARGET_BYTES,
    totalFiles: rows.length,
    totalOld,
    totalNew,
    totalSaved,
    totalRatio: `${totalRatio}%`,
    targetHitCount,
    rows,
  };

  await fs.writeFile(path.join(projectRoot, 'image-optimization-report.json'), JSON.stringify(report, null, 2), 'utf8');

  console.log(`optimized ${rows.length} files`);
  console.log(`target <= ${TARGET_BYTES} bytes, hit ${targetHitCount}/${rows.length}`);
  console.log(`total old: ${totalOld} bytes`);
  console.log(`total new: ${totalNew} bytes`);
  console.log(`saved: ${totalSaved} bytes (${totalRatio}%)`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
