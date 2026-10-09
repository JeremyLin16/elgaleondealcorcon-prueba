#!/usr/bin/env node
// Checks that every messages/*.json has exactly the same keys (CONTRIBUTING.md
// rule 9). A key missing in one language makes next-intl render the key name
// ("home.hero.title") on that language's pages, which Google then indexes.
//
//   npm run check:messages
//
// Also fails when a text is empty, still contains a template placeholder
// (a TODO marker), or uses different {placeholders} / <tags> than the same
// text in the reference language. Zero dependencies. Exits with code 1 on
// problems.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "messages");
// The reference language: the default locale in i18n/routing.ts.
const REFERENCE = "es";

const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const catalogs = Object.fromEntries(
  files.map((f) => [path.basename(f, ".json"), JSON.parse(readFileSync(path.join(dir, f), "utf8"))])
);
if (!catalogs[REFERENCE]) {
  console.error(`messages/${REFERENCE}.json not found`);
  process.exit(2);
}

/** { "home.hero.title": "..." }; objects only, so a string/object mismatch shows up as a missing key. */
function flatten(value, prefix = "", out = {}) {
  for (const [key, child] of Object.entries(value)) {
    const id = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) flatten(child, id, out);
    else out[id] = child;
  }
  return out;
}

// Placeholder markers left by the project template ("TODO" + "(setup)").
const TEMPLATE_TODO = /TODO\((setup|cliente)\)/;

const placeholders = (text) => [...text.matchAll(/\{\s*([A-Za-z_]\w*)\s*[,}]/g)].map((m) => `{${m[1]}}`);
const tags = (text) => [...text.matchAll(/<\/?([A-Za-z][\w-]*)>/g)].map((m) => `<${m[1]}>`);
const signature = (text) => [...new Set([...placeholders(text), ...tags(text)])].sort().join(" ");

const problems = [];
const flat = Object.fromEntries(Object.entries(catalogs).map(([locale, data]) => [locale, flatten(data)]));
const reference = flat[REFERENCE];

for (const [locale, messages] of Object.entries(flat)) {
  for (const [key, value] of Object.entries(messages)) {
    if (typeof value !== "string") problems.push(`${locale}: ${key} is not a string (${JSON.stringify(value)})`);
    else if (value.trim() === "") problems.push(`${locale}: ${key} is empty`);
    else if (TEMPLATE_TODO.test(value)) problems.push(`${locale}: ${key} still contains a TODO placeholder`);
  }
  if (locale === REFERENCE) continue;
  for (const key of Object.keys(reference)) {
    if (!(key in messages)) problems.push(`${locale}: missing ${key}`);
  }
  for (const key of Object.keys(messages)) {
    if (!(key in reference)) problems.push(`${locale}: ${key} does not exist in ${REFERENCE}.json`);
  }
  for (const [key, value] of Object.entries(messages)) {
    const ref = reference[key];
    if (typeof value !== "string" || typeof ref !== "string") continue;
    if (signature(value) !== signature(ref)) {
      problems.push(`${locale}: ${key} uses "${signature(value)}" but ${REFERENCE} uses "${signature(ref)}"`);
    }
  }
}

const count = Object.keys(reference).length;
if (problems.length) {
  console.log(problems.map((p) => `  ✗ ${p}`).join("\n"));
  console.log(`\n${problems.length} problem(s) in messages/ (${files.join(", ")}).`);
  process.exit(1);
}
console.log(`  ✓ ${files.join(", ")}: same ${count} keys, placeholders and tags`);
