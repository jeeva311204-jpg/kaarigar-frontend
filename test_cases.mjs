import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'http://localhost:5000/api/analyze-product';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fileToDataUrl(filePath, mimeType = 'image/jpeg') {
  const buf = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buf.toString('base64')}`;
}

async function testCase(name, filePath, mimeType, category) {
  console.log(`\n============================================================`);
  console.log(`TEST CASE: ${name}`);
  console.log(`File: ${filePath}`);
  console.log(`Category: ${category}`);
  console.log(`------------------------------------------------------------`);

  const dataUrl = fileToDataUrl(filePath, mimeType);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const startTime = Date.now();
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          category: category,
          materials: ['natural materials'],
          description: 'Testing product validation pipeline'
        })
      });

      const elapsed = Date.now() - startTime;
      console.log(`HTTP Status: ${res.status} (${elapsed}ms) [Attempt ${attempt}]`);

      const json = await res.json();
      if (res.status === 503 && attempt < 3) {
        console.warn(`Attempt ${attempt} got 503 upstream, waiting 3s before retry...`);
        await sleep(3000);
        continue;
      }

      const displayJson = { ...json };
      if (displayJson.enhancedImage) displayJson.enhancedImage = '[dataUrl stripped for console]';
      if (displayJson.originalImage) displayJson.originalImage = '[dataUrl stripped for console]';

      console.log(`Response Payload:\n${JSON.stringify(displayJson, null, 2)}`);
      return { name, status: res.status, json, elapsed };
    } catch (err) {
      console.error(`Attempt ${attempt} error for ${name}:`, err.message);
      if (attempt < 3) {
        await sleep(3000);
      } else {
        return { name, error: err.message };
      }
    }
  }
}

async function run() {
  const productsBefore = JSON.parse(fs.readFileSync('e:/shadhana/data/products.json', 'utf8'));
  console.log(`Initial products.json count: ${productsBefore.length}`);

  // Case 1: Genuine Craft
  const res1 = await testCase(
    '1. Genuine Craft (Jaipur Blue Pottery Plate)',
    'e:/shadhana/public/samples/user_blue_pottery.png',
    'image/png',
    'pottery'
  );

  console.log('\nWaiting 4s before next test case to prevent quota spike...');
  await sleep(4000);

  // Case 2: Unrelated Object
  const res2 = await testCase(
    '2. Unrelated Object (Street Light / Utility Post)',
    'e:/shadhana/public/samples/sample_utility_post.jpg',
    'image/jpeg',
    'other'
  );

  console.log('\nWaiting 4s before next test case to prevent quota spike...');
  await sleep(4000);

  // Case 3: Ambiguous Object
  const res3 = await testCase(
    '3. Ambiguous Object (Plain Ceramic Mug with no craftsmanship detail)',
    'e:/shadhana/public/samples/sample_plain_mug.jpg',
    'image/jpeg',
    'pottery'
  );

  console.log('\nWaiting 4s before next test case to prevent quota spike...');
  await sleep(4000);

  // Case 4: Infrastructure / Drainage Pipe (Permanent regression test for false positive)
  const res4 = await testCase(
    '4. Infrastructure Object (Drainage Pipe Discharging Water Into Ditch)',
    'e:/shadhana/public/samples/sample_drainage_pipe.jpg',
    'image/jpeg',
    'pottery'
  );

  const productsAfter = JSON.parse(fs.readFileSync('e:/shadhana/data/products.json', 'utf8'));
  console.log(`\nFinal products.json count: ${productsAfter.length}`);
  console.log(`Database untouched for analysis: ${productsBefore.length === productsAfter.length ? 'PASS' : 'FAIL'}`);

  // Assertions
  const cases = [res1, res2, res3, res4];
  let failed = false;
  cases.forEach((c, idx) => {
    if (idx > 0 && c.json?.isHandicraft === true) {
      console.error(`FAIL: Case ${idx + 1} (${c.name}) erroneously validated as handicraft!`);
      failed = true;
    }
  });

  if (!failed) {
    console.log('\n✅ ALL HANDICRAFT VALIDATION TESTS PASSED: Zero false positives detected.');
  }
}

run();
