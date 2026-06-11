#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { add } from "./commands/add";
import { list } from "./commands/list";

const main = defineCommand({
  meta: {
    name: "zelto-font",
    version: "0.1.0",
    description: "Fonts that are actually good — install them like components",
  },
  subCommands: {
    add,
    list,
  },
});

runMain(main);
