/**
 * Bundled by jsDelivr using Rollup v4.62.2 and esbuild v0.28.1.
 * Original file: /npm/@otplib/plugin-base32-scure@13.6.0/dist/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{base32 as n}from"@scure/base";var t=class{name="scure";encode(r,e={}){let{padding:a=!1}=e,s=n.encode(r);return a?s:s.replace(/=+$/,"")}decode(r){try{let e=r.toUpperCase(),a=e.padEnd(Math.ceil(e.length/8)*8,"=");return n.decode(a)}catch(e){throw Error(`Invalid Base32 string: ${e.message}`)}}};const c=Object.freeze(new t);export{t as ScureBase32Plugin,c as base32,t as default};
//# sourceMappingURL=/sm/10bd26c4de1986245d2e4345ee7a54f242becb292f2979820368cdafcb4dec7c.map