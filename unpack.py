#!/usr/bin/env python

from sys import stdin
from base64 import b64decode

def save_image(i, data):
  i = str(i)
  while len(i) < 5:
    i = "0" + i
  fname = "out/frame_" + i + ".png"
  with open(fname, 'w') as f:
    f.write(data)

def unpack(f):
  i = 0
  while True:
    l = f.read(4)
    if l == "":
      break
    l = map(ord, l)
    l = l[3] << 24 | l[2] << 16 | l[1] << 8  | l[0]
    data = f.read(l)
    save_image(i, data)
    i += 1

unpack(stdin)
