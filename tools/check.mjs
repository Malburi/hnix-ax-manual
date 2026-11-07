/*
 * 매뉴얼 점검 — 사이드바의 쪽이 다 있는지, 그림·쪽 링크가 깨지지 않았는지, 쓰면 안 되는 낱말·비밀번호·키가 없는지.
 *   node tools/check.mjs        (문제가 있으면 끝 코드 1)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const say = (f, m) => problems.push(`${f}: ${m}`);

const pages = new Set(["README.md"]);
for (const line of readFileSync(join(ROOT, "_sidebar.md"), "utf8").split(/\r?\n/)) {
  const m = line.match(/\]\((\/[^)]*)\)/);
  if (m) pages.add(m[1] === "/" ? "README.md" : m[1].replace(/^\//, ""));
}
for (const p of pages) if (!existsSync(join(ROOT, p))) say("_sidebar.md", `쪽이 없음 ${p}`);

const BANNED = [/\bIBM\b/, /\bICA\b/, /Orchestrate/i, /\bBob\b/, /watsonx/i, /LiteLLM/i, /HD현대/, /hd\.com/i, /hd\.local/i];
const SECRET = [/Admin!2026/, /Dev1!2026/, /pmsx1234!/, /Lake!2026/, /\bhx-[A-Za-z0-9_-]{12,}/, /[\w.+-]+@(?!example\.)[\w-]+\.[\w.]+/];

const mdFiles = [];
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", ".git", "offline", "tools", "img"].includes(e.name)) continue;
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".md") && e.name !== "_sidebar.md") mdFiles.push(p);
  }
};
walk(ROOT);

let imgRefs = 0;
const usedImgs = new Set();
for (const f of mdFiles) {
  const rel = f.slice(ROOT.length + 1).replace(/\\/g, "/");
  const text = readFileSync(f, "utf8");
  if (!pages.has(rel)) say(rel, "사이드바에 없는 쪽");
  for (const m of text.matchAll(/(?:src="|\]\()((?:img)\/[^")\s]+)/g)) {
    imgRefs++;
    usedImgs.add(m[1]);
    if (!existsSync(join(ROOT, m[1]))) say(rel, `그림 없음 ${m[1]}`);
  }
  for (const m of text.matchAll(/\]\((\/[^)#\s]*)(#[^)]*)?\)/g)) {
    const target = m[1] === "/" ? "README.md" : m[1].replace(/^\//, "");
    if (!pages.has(target)) say(rel, `깨진 쪽 링크 ${m[1]}`);
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((ln, i) => {
    for (const re of BANNED) if (re.test(ln)) say(`${rel}:${i + 1}`, `쓰면 안 되는 이름 ${re} — ${ln.trim().slice(0, 80)}`);
    for (const re of SECRET) if (re.test(ln)) say(`${rel}:${i + 1}`, `비밀번호·키·메일 의심 ${re} — ${ln.trim().slice(0, 80)}`);
  });
}

let imgCount = 0;
let imgBytes = 0;
const orphan = [];
const walkImg = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walkImg(p);
    else {
      imgCount++;
      imgBytes += statSync(p).size;
      const rel = p.slice(ROOT.length + 1).replace(/\\/g, "/");
      if (!usedImgs.has(rel)) orphan.push(rel);
    }
  }
};
if (existsSync(join(ROOT, "img"))) walkImg(join(ROOT, "img"));

console.log(`쪽 ${mdFiles.length} · 그림 참조 ${imgRefs} · 그림 파일 ${imgCount}(${(imgBytes / 1048576).toFixed(1)}MB) · 안 쓰는 그림 ${orphan.length}`);
if (orphan.length) console.log("안 쓰는 그림: " + orphan.join(", "));
if (problems.length) {
  console.log(`문제 ${problems.length}건`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("문제 없음");
