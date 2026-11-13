'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { publications, accepted, preprints, competitions, resources, shortCourses, equalContribution, copy } = require('./content.cjs');

for (const [file, lang] of [['index.html', 'en'], ['zh.html', 'zh']]) {
  const h = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const row = (id) => h.split('id="work-' + id + '"')[1].split('</li>')[0];
  const section = (id) => h.split('id="' + id + '"')[1].split('</section>')[0];
  for (const [, id] of h.matchAll(/href="#([^"]+)"/g)) {
    assert.equal(h.split('id="' + id + '"').length, 2, file + ': anchor ' + id);
  }
  for (const [id,,,, doi] of publications) assert.ok(row(id).includes('https://doi.org/' + doi));
  for (const [id,,,, url] of preprints) assert.ok(row(id).includes(url));
  assert.equal((section('published').match(/class="paper"/g) || []).length, publications.length);
  assert.equal((section('accepted').match(/class="paper"/g) || []).length, accepted.length);
  const [eaclId, eaclTitle] = accepted[0];
  assert.ok(section('accepted').includes(eaclTitle));
  assert.ok(!section('published').includes(eaclTitle));
  assert.match(row(eaclId), /<strong>Haoyi Zhang<\/strong>, Huaijin Ran/);
  assert.ok(row(eaclId).includes('EACL 2027 Findings') && row(eaclId).includes(copy[lang].status.accepted));
  assert.doesNotMatch(row(eaclId), /href=|contribution-mark|published|已发表/i);
  assert.equal((section('preprints').match(/class="paper"/g) || []).length, preprints.length);
  assert.equal((section('src').match(/class="paper"/g) || []).length, competitions.length);
  assert.match(section('src'), new RegExp(copy[lang].status.abstractAccepted));
  assert.doesNotMatch(section('src'), /doi\.org/);
  assert.match(section('talks'), /RANLP/);
  assert.match(section('talks'), /href="#work-gdpr-bench"/);
  assert.doesNotMatch(section('talks'), /doi\.org|keynote|invited|特邀|主旨/i);
  assert.equal((section('short-courses').match(/<li>/g) || []).length, shortCourses.tracks.length);
  for (const [,when] of shortCourses.tracks) assert.ok(section('short-courses').includes(when[lang === 'en' ? 0 : 1]));
  for (const [id, links] of Object.entries(resources)) {
    for (const [, url] of links) assert.ok(h.split('id="work-' + id + '"')[1].split('</ul>')[0].includes(url));
  }
  assert.equal((h.match(/class="contribution-key"/g) || []).length, 1);
  const allCredits = Object.values(equalContribution).flat();
  assert.equal((h.match(/class="contribution-mark"/g) || []).length, allCredits.length);
  for (const [id, people] of Object.entries(equalContribution)) {
    const authors = row(id).match(/<p class="authors">(.+)<\/p>/)[1].replace(/<[^>]+>/g, '');
    assert.deepEqual(authors.split(', ').filter(n => n.endsWith('†')).map(n => n.slice(0,-1)), people);
  }
  assert.doesNotMatch(h, /hotcrp|openreview\.net\/forum|chatgpt\.site|reviewer score|private-documents|certificate no/i);
  console.log(file + ': bibliography, talks, short courses, SRC, attribution and public-scope checks passed');
}
