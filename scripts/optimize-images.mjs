import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminOptipng from 'imagemin-optipng';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'sbti_images');
const outDir = path.join(projectRoot, 'public', 'images', 'results');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listImages(dir) {
  const entries = await fs.readdir(dir);
  return entries.filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
}

async function fileSize(filePath) {
  const st = await fs.stat(filePath);
  return st.size;
}

async function run() {
  await ensureDir(outDir);
  const files = await listImages(srcDir);

  const before = {};
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    before[file] = await fileSize(srcPath);
  }

  await imagemin([path.join(srcDir, '*.png')], {
    destination: outDir,
    plugins: [imageminOptipng({ optimizationLevel: 7 })],
  });

  await imagemin([path.join(srcDir, '*.jpg'), path.join(srcDir, '*.jpeg')], {
    destination: outDir,
    plugins: [imageminJpegtran({ progressive: true })],
  });

  const after = {};
  for (const file of files) {
    const outPath = path.join(outDir, file);
    after[file] = await fileSize(outPath);
  }

  const rows = files.map((file) => {
    const oldSize = before[file] ?? 0;
    const newSize = after[file] ?? 0;
    const saved = oldSize - newSize;
    const ratio = oldSize ? ((saved / oldSize) * 100).toFixed(2) : '0.00';
    return { file, oldSize, newSize, saved, ratio: `${ratio}%` };
  });

  const totalOld = rows.reduce((s, r) => s + r.oldSize, 0);
  const totalNew = rows.reduce((s, r) => s + r.newSize, 0);
  const totalSaved = totalOld - totalNew;
  const totalRatio = totalOld ? ((totalSaved / totalOld) * 100).toFixed(2) : '0.00';

  const report = {
    generatedAt: new Date().toISOString(),
    totalFiles: rows.length,
    totalOld,
    totalNew,
    totalSaved,
    totalRatio: `${totalRatio}%`,
    rows,
  };

  await fs.writeFile(path.join(projectRoot, 'image-optimization-report.json'), JSON.stringify(report, null, 2), 'utf8');

  console.log(`optimized ${rows.length} files`);
  console.log(`total old: ${totalOld} bytes`);
  console.log(`total new: ${totalNew} bytes`);
  console.log(`saved: ${totalSaved} bytes (${totalRatio}%)`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
