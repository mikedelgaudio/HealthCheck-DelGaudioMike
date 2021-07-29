/* eslint-disable no-undef */

require("dotenv").config();
const fetch = require("node-fetch");

const CLOUDFLARE_PREFIX = "https://api.cloudflare.com/client/v4/";
const CLOUDFLARE_HEADERS = {
  "X-Auth-Email": process.env?.CLOUDFLARE_X_AUTH_EMAIL,
  "X-Auth-Key": process.env?.CLOUDFLARE_X_AUTH_KEY,
  "Content-Type": "application/json",
};

const log = (message) => {
  console.log(
    `${new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    })} - ${message}`
  );
};

const handleError = (err) => {
  console.warn(err);
  return new Response(
    JSON.stringify({
      message: "Unexpected error",
    })
  );
};

const getDnsState = async (requested_url) => {
  if (!requested_url) return;
  const url = `${CLOUDFLARE_PREFIX}zones/${process.env?.CLOUDFLARE_ZONE_ID}/dns_records?name=${requested_url}`;
  const response = await fetch(url, {
    method: "GET",
    headers: CLOUDFLARE_HEADERS,
  }).catch((err) => {
    handleError(err);
  });
  return await response.json();
};

const modifyDnsIp = async (record) => {
  //if (!record.id || !record) return;
  const url = `${CLOUDFLARE_PREFIX}zones/${process.env?.CLOUDFLARE_ZONE_ID}/dns_records/${record?.id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: CLOUDFLARE_HEADERS,
    body: JSON.stringify(record),
  }).catch((err) => {
    handleError(err);
    return;
  });
  return await response.json();
};

const getDnsHealth = async (requested_url) => {
  if (!requested_url) return;
  const response = await fetch(requested_url, {
    method: "GET",
  }).catch((err) => {
    console.log(err);
    console.log(1);
    //handleError(err);
    return;
  });

  if (response.ok) {
    return await response.json();
  } else {
    return Promise.reject(
      `Error ${response.status}, unable to resolve website.`
    );
  }
};

// const l = getDnsState("apibullishbay.delgaudiomike.com");
// console.log(l.then((d) => console.log(d)));

// test.then((d) => console.log(d));

// const tester = getDnsHealth("https://bulli2shbay.delgaudiomike.com");
// tester.then((d) => console.log(d)).catch((e) => e);

/**
 * Switches the provided site name to the primary DNS IP
 * @param {string} id cloudflare provided DNS ID
 * @param {string} site website to switch DNS IP for
 */
const switchToPrimary = async (id, site) => {
  await modifyDnsIp({
    id,
    type: "A",
    name: site,
    content: process?.env?.PRIMARY_IP,
    ttl: 1,
    proxied: true,
  }).catch(() => {
    handleModifyError(site, "PRIMARY");
    return;
  });
  handleModifySuccess(site, "PRIMARY");
};

/**
 * Switches the provided site name to the secondary DNS IP
 * @param {string} id cloudflare provided DNS ID
 * @param {string} site website to switch DNS IP for
 */
const switchToSecondary = async (id, site) => {
  await modifyDnsIp({
    id,
    type: "A",
    name: site,
    content: process?.env?.SECONDARY_IP,
    ttl: 1,
    proxied: true,
  }).catch(() => {
    handleModifyError(site, "SECONDARY");
    return;
  });
  handleModifySuccess(site, "SECONDARY");
};

const handleModifySuccess = (site, location) => {
  log(`Successfully swapped DNS entry to ${location} for: ${site}`);
};

const handleModifyError = (site, location) => {
  log(`Unable to modify DNS entry to ${location} for: ${site}`);
};

const SUBDOMAINS = {
  neu: process?.env?.CF_NEU_ID,
  weatherflash: process?.env?.CF_WEATHERFLASH_ID,
  bullishbay: process?.env?.CF_BULLISHBAY_ID,
  apibullishbay: process?.env?.CF_APIBULLISHBAY_ID,
};

const DOMAINS = {
  "delgaudiomike.com": process?.env?.CF_DELGAUDIOMIKE_ID,
};

const healthcheck = async () => {
  for (const site in SUBDOMAINS) {
    console.log(`Testing now: https://${site}.delgaudiomike.com`);
  }
  for (const site in DOMAINS) {
    console.log(`Testing now: https://${site}`);
  }
};

switchToSecondary("", "test");

// setInterval(healthcheck, 300000);
