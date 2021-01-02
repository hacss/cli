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

const main = code => {
  if (!code && process.argv.length < 3) {
    console.log(
      "Usage: hacss [--config <config-file>] [--output <output-file>] <sources>",
    );
    return process.exit();
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

  if ("version" in options) {
    console.log(
      `v${
        require(options.version
          ? `@hacss/${options.version}/package.json`
          : "./package.json").version
      }`,
    );
    return Promise.resolve();
  }

  return build(code ? Object.assign({}, options, { code }) : options)
    .then(({ code: css }) => {
      if (options.output) {
        return writeFile(
          path.join(process.cwd(), options.output),
          css,
        ).then(() =>
          console.log(`Successfully generated style sheet ${options.output}`),
        );
      }

      process.stdout.write(css);
      return Promise.resolve();
    })
    .then(() => {
      process.exit();
    })
    .catch(err => console.error(err));
};

const timeout = setTimeout(main, 50);
const stdinListener = code => {
  clearTimeout(timeout);
  main(code);
};
process.stdin.setEncoding("utf8");
process.stdin.once("data", stdinListener);
