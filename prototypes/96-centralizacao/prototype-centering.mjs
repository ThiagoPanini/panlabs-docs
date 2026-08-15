// PROTOTYPE — descartável. Testa se `div:has(> main)` centraliza sidebar+main
// sem tocar classe hasheada, sem swizzle. Issue #96.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const puppeteer = require('/home/paninit/.npm/_npx/1a4eb60c8f6b0f89/node_modules/puppeteer');

const URL = 'http://localhost:3000/shinydoc-docusaurus/procedimentos/esteiras/publicar-um-pacote-interno';
const CANDIDATE_CSS = `
html.docs-doc-page div:has(> main) {
  max-width: 1472px;
  margin-inline: auto;
}
`;

const browser = await puppeteer.launch({ headless: 'new' });
const results = {};

for (const width of [1920, 1300]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 1000 });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const before = await page.evaluate(() => {
    const main = document.querySelector('main');
    const sidebar = document.querySelector('.theme-doc-sidebar-container') || document.querySelector('aside');
    const toc = document.querySelector('.theme-doc-toc-desktop');
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { left: b.left, right: b.right, width: b.width, top: b.top };
    };
    return {
      matchCount: document.querySelectorAll('div:has(> main)').length,
      viewportWidth: window.innerWidth,
      sidebar: r(sidebar),
      main: r(main),
      toc: r(toc),
    };
  });

  await page.addStyleTag({ content: CANDIDATE_CSS });
  // let layout settle
  await new Promise((res) => setTimeout(res, 150));

  const after = await page.evaluate(() => {
    const main = document.querySelector('main');
    const sidebar = document.querySelector('.theme-doc-sidebar-container') || document.querySelector('aside');
    const toc = document.querySelector('.theme-doc-toc-desktop');
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { left: b.left, right: b.right, width: b.width, top: b.top };
    };
    const sticky = (el) => el ? getComputedStyle(el).position : null;
    return {
      viewportWidth: window.innerWidth,
      sidebar: r(sidebar),
      main: r(main),
      toc: r(toc),
      sidebarPosition: sticky(sidebar),
      tocPosition: sticky(toc),
      bodyScrollWidth: document.body.scrollWidth,
      rightMargin: window.innerWidth - r(toc)?.right,
    };
  });

  const shotPath = `/home/paninit/.claude/jobs/d9e75b1c/tmp/proto-${width}.png`;
  await page.screenshot({ path: shotPath, fullPage: false });

  results[width] = { before, after, shotPath };
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
