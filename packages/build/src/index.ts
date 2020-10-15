#!/usr/bin/env node
import { fixTsconfig } from "./fixTsconfig";
import { patchTypescript } from "./patchTypescript";
import { ts, tsc } from "./tsc";

fixTsconfig();
patchTypescript(ts);
tsc();
