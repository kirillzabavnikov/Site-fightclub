// Сборка кода для Tilda и локального превью.
//
// В проекте Tilda шапка и подвал — общие страницы (Header / Footer), поэтому код разбит на блоки:
//   tilda/01-header.html — новая шапка + общие стили/скрипты (страница-хедер «header-new»)
//   tilda/02-footer.html — блок записи, «работа/франшиза», подвал (страница-футер «footer-new»)
//   tilda/home.html      — контент главной
//   tilda/sambo.html     — контент страницы направления (шаблон)
// Каждый файл вставляется целиком в один блок T123 («HTML-код»).
//
// preview/<page>.html — страница целиком (шапка + контент + подвал + копия тильдовских попапов).
// Запуск: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const inc = (html) => html.replace(/<!-- @include (\w+) -->/g, (_, n) => read(`src/partials/${n}.html`).trim());

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet">';

const banner = (what, where) =>
  `<!-- Мир единоборств · ${what}\n     Куда: ${where} → один блок T123 «HTML-код», вставить файл целиком.\n     Сгенерировано scripts/build.mjs — правки вносите в src/ и пересобирайте. -->\n`;

const blocks = {
  header: banner('шапка + общие стили и скрипты', 'страница-хедер «header-new»') +
    `${FONTS}\n<style>\n${read('src/shared.css')}\n</style>\n` +
    `<div class="me me-shell">\n${inc('<!-- @include icons -->\n<!-- @include header -->')}\n</div>\n` +
    `<script>\n${read('src/shared.js')}\n</script>\n`,
  footer: banner('запись, работа/франшиза, подвал', 'страница-футер «footer-new»') +
    `<div class="me me-shell">\n${inc('<!-- @include cta -->\n<!-- @include join -->\n<!-- @include footer -->')}\n</div>\n`,
  home: banner('контент главной', 'главная страница') +
    `<style>\n${read('src/home.css')}\n</style>\n<div class="me me--home">\n${read('src/pages/home.html')}</div>\n<script>\n${read('src/home.js')}\n</script>\n`,
  sambo: banner('контент страницы направления «Самбо» (шаблон для остальных)', 'страница /sambo') +
    `<style>\n${read('src/discipline.css')}\n</style>\n<div class="me me--disc">\n${read('src/pages/sambo.html')}</div>\n<script>\n${read('src/discipline.js')}\n</script>\n`,
};

mkdirSync(join(root, 'tilda'), { recursive: true });
mkdirSync(join(root, 'preview'), { recursive: true });
writeFileSync(join(root, 'tilda/01-header.html'), blocks.header);
writeFileSync(join(root, 'tilda/02-footer.html'), blocks.footer);
writeFileSync(join(root, 'tilda/home.html'), blocks.home);
writeFileSync(join(root, 'tilda/sambo.html'), blocks.sambo);
for (const [k, v] of Object.entries(blocks)) console.log(`tilda ${k}: ${(v.length / 1024).toFixed(1)} KB`);

const popups = read('preview/_tilda-popups.html');
const previewStub = `<script>
/* ТОЛЬКО ДЛЯ ПРЕВЬЮ: имитация тильдовских попапов. В Tilda их открывает её собственный скрипт. */
(function(){
  function open(hook){var p=document.querySelector('.t-popup[data-tooltip-hook="'+hook+'"]');if(!p)return;
    p.style.display='block';requestAnimationFrame(function(){p.classList.add('t-popup_show');});document.body.classList.add('t-body_scroll-locked');
    var i=p.querySelector('input,textarea');if(i)setTimeout(function(){i.focus()},300);}
  function close(p){p.classList.remove('t-popup_show');setTimeout(function(){p.style.display='none'},300);document.body.classList.remove('t-body_scroll-locked');}
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#popup:"]'); if(a){e.preventDefault();open(a.getAttribute('href'));return;}
    var c=e.target.closest('.t-popup__close'); if(c){close(c.closest('.t-popup'));return;}
    if(e.target.classList&&e.target.classList.contains('t-popup'))close(e.target);
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('.t-popup_show').forEach(close);});
  document.addEventListener('submit',function(e){e.preventDefault();alert('Превью: в Tilda заявка уйдёт в подключённые сервисы.');});
})();
</script>`;

for (const [name, title] of [['home', 'Мир единоборств — сеть спортивных клубов'], ['sambo', 'Самбо — Мир единоборств']]) {
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} (превью редизайна)</title>
<link rel="stylesheet" href="https://static.tildacdn.com/css/tilda-grid-3.0.min.css">
<link rel="stylesheet" href="https://static.tildacdn.com/css/tilda-popup-1.1.min.css">
<link rel="stylesheet" href="https://static.tildacdn.com/css/tilda-forms-1.0.min.css">
<style>html,body{margin:0;background:#0b0b0c}</style>
</head>
<body class="t-body">
${blocks.header}
${blocks[name]}
${blocks.footer}
${popups}
${previewStub}
</body>
</html>
`;
  writeFileSync(join(root, `preview/${name}.html`), html);
}
console.log('preview: home.html, sambo.html');
