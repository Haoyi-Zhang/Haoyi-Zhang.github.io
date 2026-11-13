'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { links, models, publications, accepted, preprints, equalContribution, competitions, resources, shortCourses, copy } = require('./content.cjs');
const origin = 'https://haoyi-zhang.github.io/';
const e = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const anchor = (url, title, cls = '') => '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + e(url) + '">' + e(title) + '</a>';
const labelProfiles = [
  ['Google Scholar', links.scholar],
  ['GitHub', links.github],
  ['ORCID', links.orcid],
  ['Researchr', links.conference],
];
const sections = ['research','education','publications','contact'];

const records = new Map([...publications, ...accepted, ...preprints, ...competitions].map(row => [row[0], row]));
if (records.size !== publications.length + accepted.length + preprints.length + competitions.length) {
  throw new Error('Duplicate research output ID');
}
for (const [id, names] of Object.entries(equalContribution)) {
  const authors = records.get(id)?.[2];
  if (names.length < 2 || !authors || new Set(names).size !== names.length || !names.every(n => authors.includes(n))) {
    throw new Error('Invalid equal-contribution group: ' + id);
  }
}

function workRow(row, words, source = 'publication') {
  const [id, title, names, venue, ref, kind, status] = row;
  const equal = new Set(equalContribution[id] || []);
  const byline = names.map(n => {
    const name = n === 'Haoyi Zhang' ? '<strong>' + e(n) + '</strong>' : e(n);
    return name + (equal.has(n) ? '<sup class="contribution-mark" aria-label="' + e(words.contribution) + '">†</sup>' : '');
  }).join(', ');
  const titleMarkup = source === 'competition' || !ref ? e(title) : anchor(source === 'publication' ? 'https://doi.org/' + ref : ref, title);
  const related = [
    ...(source === 'competition' ? [[words.competitionLink, ref]] : []),
    ...(resources[id] || []).map(([key, url]) => [words.resource[key], url]),
  ];
  return `
    <li class="paper" id="work-${id}">
      <span class="paper-type">${e(words.label[kind])}</span>
      <div>
        <h4 lang="en">${titleMarkup}</h4>
        <p class="authors">${byline}</p>
        <p class="venue">${e(venue)}${status ? ' <span class="work-status">' + e(words.status[status]) + '</span>' : ''}</p>
        ${words.notes[id] ? '<p class="work-note">' + e(words.notes[id]) + '</p>' : ''}
        ${related.length ? '<ul class="resource-links">' + related.map(([label,url]) => '<li>' + anchor(url,label) + '</li>').join('') + '</ul>' : ''}
      </div>
    </li>`;
}

function page(lang) {
  const w = copy[lang], zh = lang === 'zh';
  const pageLang = zh ? 'zh-Hans' : 'en';
  const canonical = origin + (zh ? 'zh.html' : '');
  const title = zh ? '张郝伊 · 学术主页' : 'Haoyi Zhang · Academic Homepage';
  return `<!doctype html>
<html lang="${pageLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title>
  <meta name="description" content="${e(w.tagline)}">
  <meta name="author" content="Haoyi Zhang">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(w.tagline)}">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${zh ? 'zh_CN' : 'en_US'}">
  <meta property="profile:first_name" content="Haoyi">
  <meta property="profile:last_name" content="Zhang">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${origin}">
  <link rel="alternate" hreflang="zh-Hans" href="${origin}zh.html">
  <link rel="icon" href="assets/mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/homepage.css">
</head>
<body id="top">
  <a class="skip-link" href="#content">${e(w.skip)}</a>
  <header class="site-header">
    <div class="wrap header-row">
      <a class="brand" href="#top"><span class="brand-mark" aria-hidden="true">HZ</span> ${e(w.name)}</a>
      <nav class="nav" aria-label="${zh ? '主导航' : 'Main navigation'}">
        ${sections.map((id, i) => anchor('#' + id, w.nav[i])).join('')}
      </nav>
      <div class="languages" aria-label="${zh ? '页面语言' : 'Page language'}">
        <a href="./" lang="en" hreflang="en"${zh ? '' : ' aria-current="page"'}>EN</a>
        <a href="zh.html" lang="zh-Hans" hreflang="zh-Hans"${zh ? ' aria-current="page"' : ''}>中文</a>
      </div>
    </div>
  </header>
  <main class="wrap" id="content">
    <section class="hero" id="about" aria-labelledby="name">
      <div>
        <p class="eyebrow">${zh ? '学术主页' : 'Academic homepage'}</p>
        <h1 id="name">${e(w.name)}${zh ? ' <span lang="en">Haoyi Zhang</span>' : ''}</h1>
        <p class="tagline">${e(w.tagline)}</p>
        <p class="intro">${e(w.intro)}</p>
        <div class="profile-links">
          ${anchor('#research', w.selectedLink,'primary-link')}
          ${anchor(links.scholar,'Google Scholar')}
          ${anchor(links.github,'GitHub')}
        </div>
      </div>
      <aside class="degree-card" aria-label="${e(w.snapshot)}">
        <p class="eyebrow">${e(w.snapshot)}</p>
        <p class="degree-university">${e(w.liverpool)}</p>
        <p class="degree-honors">${e(w.honors)}</p>
        <div class="degree-rule"></div>
        <p class="degree-campus">${zh ? '就读于' : 'Studied at'}<br><strong>${e(w.xjtlu)}</strong></p>
        ${anchor('#education', w.snapshotLink + ' ↓', 'card-link')}
      </aside>
    </section>
    <section class="section" id="research" aria-labelledby="research-heading">
      <div class="section-head">
        <h2 id="research-heading">${e(w.nav[0])}</h2>
        <p>${e(w.researchIntro)}</p>
      </div>
      <ol class="interests">
        ${w.work.map(([name, description, projects], i) => `<li><span class="index" aria-hidden="true">0${i+1}</span><div><h3>${e(name)}</h3><p>${e(description)}</p><ul class="resource-links">${projects.map(([label,id]) => '<li>' + anchor('#work-' + id,label) + '</li>').join('')}</ul></div></li>`).join('')}
      </ol>
    </section>
    <section class="section education" id="education" aria-labelledby="education-heading">
      <div class="section-head"><h2 id="education-heading">${e(w.nav[1])}</h2></div>
      <div class="education-row">
        <p class="time">${e(w.dates)}</p>
        <div>
          <h3>${e(w.liverpool)}</h3>
          <p class="degree-name">${e(w.degree)}</p>
          <p class="honors">${e(w.honors)}</p>
          <p class="muted">${e(w.study)}</p>
        </div>
      </div>
      <section class="training" id="short-courses" aria-labelledby="training-heading">
        <h3 id="training-heading">${e(w.training)}</h3>
        <div>
          <p class="training-title">${anchor(shortCourses.url, w.trainingTitle)}</p>
          <p class="venue">${e(shortCourses.organizer)}</p>
          <ul class="course-list">
            ${shortCourses.tracks.map(([name,when]) => `<li><span lang="en">${e(name)}</span><span class="venue">${e(when[zh ? 1 : 0])}</span></li>`).join('')}
          </ul>
        </div>
      </section>
    </section>
    <section class="section" id="publications" aria-labelledby="publications-heading">
      <div class="section-head"><h2 id="publications-heading">${e(w.nav[2])}</h2></div>
      <nav class="work-nav" aria-label="${e(w.resultsNav)}">
        ${anchor('#accepted', w.accepted)}
        ${anchor('#published', w.published)}
        ${anchor('#preprints', w.preprints)}
        ${anchor('#talks', w.talks)}
        ${anchor('#src', w.competition)}
      </nav>
      <section class="work-group" id="accepted" aria-labelledby="accepted-heading">
        <div class="work-head"><h3 id="accepted-heading">${e(w.accepted)}</h3></div>
        <ol class="papers">${accepted.map(row => workRow(row,w,'accepted')).join('')}</ol>
      </section>
      <section class="work-group" id="published" aria-labelledby="published-heading">
        <div class="work-head"><h3 id="published-heading">${e(w.published)}</h3><p><span class="contribution-key">† ${e(w.contribution)}.</span></p></div>
        <ol class="papers">${publications.map(row => workRow(row,w)).join('')}</ol>
      </section>
      <section class="work-group" id="preprints" aria-labelledby="preprints-heading">
        <div class="work-head"><h3 id="preprints-heading">${e(w.preprints)}</h3><p>${e(w.preprintIntro)}</p></div>
        <ol class="papers">${preprints.map(row => workRow(row,w,'public')).join('')}</ol>
      </section>
      <section class="work-group" id="talks" aria-labelledby="talks-heading">
        <div class="work-head"><h3 id="talks-heading">${e(w.talks)}</h3></div>
        <article class="paper" id="talk-ranlp">
          <span class="paper-type">RANLP</span>
          <div>
            <h4>${e(w.ranlpTitle)}</h4>
            <p class="venue">${e(w.ranlpEvent)}</p>
            <p class="work-note">${e(w.ranlpDescription)}</p>
            <ul class="resource-links"><li>${anchor('#work-gdpr-bench', w.ranlpLink)}</li></ul>
          </div>
        </article>
      </section>
      <section class="work-group" id="src" aria-labelledby="src-heading">
        <div class="work-head"><h3 id="src-heading">${e(w.competition)}</h3></div>
        <ol class="papers">${competitions.map(row => workRow(row,w,'competition')).join('')}</ol>
      </section>
    </section>
    <section class="section collaboration" id="collaboration" aria-labelledby="collaboration-heading">
      <div class="section-head"><h2 id="collaboration-heading">${e(w.collab)}</h2><p>${e(w.modelCopy)}</p></div>
      <ul class="model-list">${models.map(([name,url]) => '<li>' + anchor(url,name + ' ↗') + '</li>').join('')}</ul>
    </section>
    <section class="section contact" id="contact" aria-labelledby="contact-heading">
      <div class="section-head"><h2 id="contact-heading">${e(w.nav[3])}</h2><p>${e(w.contacts)}</p></div>
      <div class="profile-links">${anchor('mailto:' + links.email,zh ? '电子邮件' : 'Email','primary-link')}${labelProfiles.map(([name,url]) => anchor(url,name)).join('')}</div>
    </section>
  </main>
  <footer class="wrap footer"><span>${e(w.name)}</span>${anchor('#top',w.back + ' ↑')}</footer>
</body>
</html>
`.replace(/^[ \t]+\n/gm, '');
}

fs.writeFileSync(path.join(__dirname,'index.html'), page('en'));
fs.writeFileSync(path.join(__dirname,'zh.html'), page('zh'));
fs.writeFileSync(path.join(__dirname,'404.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Page not found · Haoyi Zhang</title>
<link rel="stylesheet" href="/assets/homepage.css"></head>
<body><main class="wrap not-found"><p class="eyebrow">404</p><h1>Page not found</h1>
<p>This address does not point to a page on the site.</p><p><a href="/">Go to the homepage</a> · <a href="/zh.html" lang="zh-Hans">返回中文主页</a></p></main></body></html>
`);
