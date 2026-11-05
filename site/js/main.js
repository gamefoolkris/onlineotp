var getElem = (id) => document.getElementById(id);
var entries = [];
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder();

function strToHash(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }

  return hash;
}

function makeIcon(issuer) {
  let color = `hsl(${Math.abs(strToHash(str)) % 360}, 65%, 50%)`;
  let char = issuer[0];
}

function from64(b64) {
  const binaryString = atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}
function toCSV(dat) {
  return Papa.unparse(dat);
}
function fromCSV(dat) {
  return Papa.parse(dat, {
    header: true,
    dynamicTyping: true
  });
}
async function save() {
  let plain = toCSV(generators.map(g => {
    return {
      name: g.name,
      issuer: g.issuer,
      secret: g.secret,
      algorithm: g.algorithm,
      digits: g.digits,
      period: g.period
    };
  }));
}
async function selectFiles({ accept = "*", multiple = true } = {}) {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = multiple;

    input.addEventListener("change", () => {
      resolve(Array.from(input.files ?? []));
      input.remove();
    }, { once: true });

    input.addEventListener("cancel", () => {
      resolve([]);
      input.remove();
    }, { once: true });

    input.click();
  });
}
function scanQRCode(file) {
  return new Promise(async function(resolve, reject) {
    try {
      const img = new Image();
      img.onload = function() {
        URL.revokeObjectURL(this.src);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth"
        });

        resolve(code);
      };
      img.onerror = function(e) {
        URL.revokeObjectURL(this.src);
        reject(e);
      };
      img.src = URL.createObjectURL(file);
    } catch(e) {
      reject(e);
    }
  })
}
async function makeKey(pass, {
  salt = crypto.getRandomValues(new Uint8Array(16)),
  time = 3,
  mem = 65536,
  hashLen = 32,
  threads = 1,
  type = argon2.ArgonType.Argon2id,
  encoded = undefined
} = {}) {
  if(!encoded) {
    return await argon2.hash({
      pass,
      salt,
      time,
      mem,
      hashLen,
      parallelism: threads,
      type
    });
  } else {
    encoded = encoded.split("$");
    encoded[3] = encoded[3].split(",");
    return await argon2.hash({
      pass,
      salt: from64(encoded[4]),
      time: parseInt(encoded[3][1].replace("t=", "")),
      mem: parseInt(encoded[3][0].replace("m=", "")),
      hashLen,
      parallelism: parseInt(encoded[3][2].replace("p=", "")),
      type: encoded[1] === "argon2id" ? argon2.ArgonType.Argon2id : encoded[1] === "argon2i" ? argon2.ArgonType.Argon2i : argon2.ArgonType.Argon2d
    });
  }
}
async function encrypt(data, hash, iv = crypto.getRandomValues(new Uint8Array(12))) {
  let key = await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  return [
    new Uint8Array(await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    )),
    iv
  ]
}
async function decrypt(data, hash, iv) {
  let key = await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  return new Uint8Array(await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  ));
}
async function checkPass(pass, encoded) {
  try {
    await argon2.verify({
      pass,
      encoded
    });
    return true;
  } catch(e) {
    return false;
  }
}
var elems = {
  "entries": getElem("entries"),
  "newFromQR": getElem("newFromQR"),
}
class TOTP {
  name = "";
  issuer = "";
  secret = "";
  algorithm = "SHA1";
  digits = 6;
  period = 30;
  constructor(config) {
    this.config(config);
  }
  config(config) {
    if(config?.name != null) this.name = config.name;
    if(config?.issuer != null) this.issuer = config.issuer;
    if(config?.secret != null) this.secret = config.secret;
    if(config?.algorithm != null) this.algorithm = config.algorithm;
    if(config?.digits != null) this.digits = config.digits;
    if(config?.period != null) this.period = config.period;
  }
  generate() {
    return otplib.generate({
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      secret: this.secret
    });
  }
}
class Entry {
  #iconSrc = "img/blank.svg";
  #name = "Kris";
  #issuer = "SeuthD3";
  #secret = "4P3G6YKZ56MMSGX3PMJZ3LC4S7GHREB7"; // Generated as a placeholder, hopefully does not do anything
  #algorithm = "SHA1";
  #digits = 6;
  #period = 30;
  generator = null;
  set icon(value) {
    return this.elems.icon.src = this.#iconSrc = value;
  }
  set name(value) {
    return this.elems.name.innerText = this.generator.name = this.#name = value;
  }
  set issuer(value) {
    return this.elems.issuer.innerText = this.generator.issuer = this.#issuer = value;
  }
  set secret(value) {
    return this.generator.secret = this.#secret = value;
  }
  set algorithm(value) {
    return this.generator.algorithm = this.#algorithm = value;
  }
  set digits(value) {
    return this.generator.digits = this.#digits = value;
  }
  set period(value) {
    return this.generator.period = this.#period = value;
  }
  get icon() {
    return this.elems.icon.src = this.#iconSrc;
  }
  get name() {
    return this.elems.name.innerText = this.#name = this.generator.name;
  }
  get issuer() {
    return this.elems.issuer.innerText = this.#issuer = this.generator.issuer;
  }
  get secret() {
    return this.#secret = this.generator.secret;
  }
  get algorithm() {
    return this.#algorithm = this.generator.algorithm;
  }
  get digits() {
    return this.#digits = this.generator.digits;
  }
  get period() {
    return this.#period = this.generator.period;
  }
  constructor(config) {
    this.generator = new TOTP({
      name: this.#name,
      issuer: this.#issuer,
      secret: this.#secret,
      algorithm: this.#algorithm,
      digits: this.#digits,
      period: this.#period,
    });
    let els = {};
    els.hr = document.createElement("hr");
    els.entry = document.createElement("div");
    els.icon = document.createElement("img");
    els.issuer = document.createElement("a");
    els.name = document.createElement("a");
    els.timer = document.createElement("span");
    els.code = document.createElement("a");
    els.timerBG = document.createElement("span");
    els.timerFG = document.createElement("span");
    els.timerEnd1 = document.createElement("span");
    els.timerEnd2 = document.createElement("span");
    els.entry.className = "entry";
    els.icon.className = "entryIcon";
    els.issuer.className = "entryIssuer";
    els.name.className = "entryName";
    els.timer.className = "timer";
    els.code.className = "entryCode";
    els.timerBG.className = "timerBG";
    els.timerFG.className = "timerFG";
    if(elems.entries.children.length > 0) {
      elems.entries.appendChild(els.hr);
    }
    elems.entries.appendChild(els.entry);
    els.entry.appendChild(els.icon);
    els.entry.appendChild(els.issuer);
    els.entry.appendChild(els.name);
    els.entry.appendChild(els.timer);
    els.entry.appendChild(els.code);
    els.timer.appendChild(els.timerBG);
    els.timer.appendChild(els.timerFG);
    this.elems = els;
    this.config(config);
    entries.push(this);
    requestAnimationFrame(this.#genLoop.bind(this));
  }
  config(config) {
    this.icon = config?.icon ?? this.icon;
    this.name = config?.name ?? this.name;
    this.issuer = config?.issuer ?? this.issuer;
    this.secret = config?.secret ?? this.secret;
    this.algorithm = config?.algorithm ?? this.algorithm;
    this.digits = config?.digits ?? this.digits;
    this.period = config?.period ?? this.period;
  }
  async #genLoop() {
    this.elems.timer.style.setProperty('--progress', `${Math.floor((Date.now() / (this.#period * 10)) % 100)}`);
    try {
      this.elems.code.innerText = await this?.generator.generate();
    } catch(e) {
      this.elems.code.innerText = "------";
    }
    requestAnimationFrame(this.#genLoop.bind(this));
  }
  getURI() {
    return `otpauth://totp/${encodeURIComponent(this.issuer)}:${encodeURIComponent(this.name)}?secret=${encodeURIComponent(this.secret)}&issuer=${encodeURIComponent(this.issuer)}&algorithm=${encodeURIComponent(this.algorithm)}&digits=${encodeURIComponent(this.digits)}&period=${encodeURIComponent(this.period)}`;
  }
}
async function save() {
  let plainBytes = textEncoder.encode(toCSV(entries.map(e => {
    return {
      name: e.name,
      issuer: e.issuer,
      secret: e.secret,
      algorithm: e.algorithm,
      digits: e.digits,
      period: e.period
    };
  })));
  let cipherBytes = await encrypt(plainBytes, saveKey.hash);
  console.log(cipherBytes);
}
elems.newFromQR.addEventListener("click", async function() {
  let image = (await selectFiles({multiple: false}))[0];
  if(!image) return;
  let code;
  try {
    code = await scanQRCode(image);
  } catch(e) {
    alert("Invalid image");
    throw e;
  }
  if(!code) {
    alert("No QR code found");
    throw new Error("No QR code found");
  }
  
})