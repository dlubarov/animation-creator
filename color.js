function hsv2rgb(h, s, v) {
    h = (h % 1 + 1) % 1; // wrap hue

    var i = Math.floor(h * 6),
        f = h * 6 - i,
        p = v * (1 - s),
        q = v * (1 - s * f),
        t = v * (1 - s * (1 - f));

    switch (i) {
        case 0: return [v, t, p];
        case 1: return [q, v, p];
        case 2: return [p, v, t];
        case 3: return [p, q, v];
        case 4: return [t, p, v];
        case 5: return [v, p, q];
    }
}

function mixColors(a, b, aAmount) {
  aAmount = clamp(aAmount, 0, 1);
  var bAmount = 1 - aAmount;
  var result = [];
  for (var i = 0; i < 3; ++i) {
    result.push(aAmount * a[i] + bAmount * b[i]);
  }
  return result;
}

function parts2int(parts) {
  var rgb = 0;
  for (var i = 0; i < 3; ++i) {
    rgb <<= 8;
    rgb |= parts[i] * 0xFF & 0xFF;
  }
  return rgb;
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}
