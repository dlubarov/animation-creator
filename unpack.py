#!/usr/bin/env python

from sys import stdin
from base64 import b64decode

def save_image(i, data):
  fname = "out/frame_" + str(i) + ".png"
  with open(fname, 'w') as f:
    f.write(data)

def unpack():
  data = stdin.read()
  parts = data.split('|')
  parts = [b64decode(p) for p in parts]
  for i, part in enumerate(parts):
    save_image(i, part)

unpack()
