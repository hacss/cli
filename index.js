#!/usr/bin/env node

const { promisify } = require("util");
const writeFile = promisify(require("fs").writeFile);
const path = require("path");

const {
  adjust,
  apply,
  call,
  concat,
  drop,
  dropWhile,
  equals,
  flatten,
  flip,
  fromPairs,
  head,
  ifElse,
  insert,
  length,
  map,
  of,
  pipe,
  repeat,
  splitEvery,
  startsWith,
  takeWhile,
} = require("ramda");

const build = require("@hacss/build");

if (process.argv.length < 3) {
  return console.log(
    "Usage: hacss [--config <config-file>] [--output <output-file>] <sources>",
  );
}

const options = call(
  pipe(
    drop(2),
    splitEvery(2),
    flip(repeat)(2),
    adjust(
      0,
      pipe(takeWhile(pipe(head, startsWith("--"))), map(adjust(0, drop(2)))),
    ),
    adjust(
      1,
      pipe(
        dropWhile(pipe(head, startsWith("--"))),
        flatten,
        of,
        insert(0, "sources"),
        of,
      ),
    ),
    apply(concat),
    fromPairs,
  ),
  process.argv,
);

const mkWarning = ignored => {
  const msg =
    ignored.length === 1
      ? "a potential rule due to an error"
      : "some potential rules due to errors";
  return `
Hacss ignored ${msg}:
${ignored.map(({ className, error }) => `${className} - ${error}`).join("\n")}
`;
};

const main = async () => {
  if ("version" in options) {
    return console.log(
      `v${
        require(options.version
          ? `@hacss/${options.version}/package.json`
          : "./package.json").version
      }`,
    );
  }
  const { css, ignored } = await build(options);
  if (options.output) {
    await writeFile(path.join(process.cwd(), options.output), css);
    if (ignored.length) {
      console.warn(mkWarning(ignored));
    }
    console.log(`Successfully generated style sheet ${options.output}`);
  } else {
    const code = `${css}${
      ignored.length
        ? `

/*
${mkWarning(ignored)}
*/`
        : ""
    }`;
    process.stdout.write(code);
  }
};

main().catch(err => console.error(err));
