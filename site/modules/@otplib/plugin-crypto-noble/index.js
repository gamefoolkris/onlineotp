/**
 * Bundled by jsDelivr using Rollup v4.62.2 and esbuild v0.28.1.
 * Original file: /npm/@otplib/plugin-crypto-noble@13.6.0/dist/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{hmac as m}from"@noble/hashes/hmac.js";import{sha1 as n}from"@noble/hashes/legacy.js";import{sha512 as i,sha256 as h}from"@noble/hashes/sha2.js";import{randomBytes as l}from"@noble/hashes/utils.js";import{normalizeHashAlgorithm as c,constantTimeEqual as p}from"@otplib/core";const a={sha1:n,sha256:h,sha512:i},u=Object.freeze(Object.keys(a));var e=class{name="noble";algorithms=u;hmac(t,r,o){let s=c(t,{supported:this.algorithms,plugin:this.name});return m(a[s],r,o)}randomBytes(t){return l(t)}constantTimeEqual(t,r){return p(t,r)}};const f=Object.freeze(new e);export{e as NobleCryptoPlugin,f as crypto,e as default};
//# sourceMappingURL=/sm/6ec3ef863e8f94344d4b74564206ccd8db513970cc7087e0f4a687de774a0c2d.map