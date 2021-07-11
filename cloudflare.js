/* eslint-disable no-undef */

require("dotenv").config();
const fetch = require("node-fetch");

const CLOUDFLARE_PREFIX = "https://api.cloudflare.com/client/v4/";
const CLOUDFLARE_HEADERS = {
  "X-Auth-Email": process.env?.CLOUDFLARE_X_AUTH_EMAIL,
  "X-Auth-Key": process.env?.CLOUDFLARE_X_AUTH_KEY,
  "Content-Type": "application/json",
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

const getDnsHealth = async (url) => {
  const response = await fetch(url, {
    method: "GET",
  }).catch((err) => {
    console.log(err);
    console.log(1);
    //handleError(err);
    return;
  });
  return await response;
};

// const l = getDnsState("apibullishbay.delgaudiomike.com");
// console.log(l.then((d) => console.log(d)));

// const test = modifyDnsIp({
//   id: "",
//   type: "A",
//   name: "we",
//   content: process.env?.SECONDARY_IP,
//   ttl: 1,
//   proxied: true,
// });

// test.then((d) => console.log(d));

const tester = getDnsHealth("https://bullishbay.delgaudiomike.com");
tester.then((d) => console.log(d)).catch((e) => e);
