#!/usr/bin/env node

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

const main = async () => {
  const css = await build(options);
  if (options.output) {
    await writeFile(path.join(process.cwd(), options.output), css);
    console.log(`Successfully generated style sheet ${options.output}`);
  } else {
    process.stdout.write(css);
  }
};

main().catch(err => console.error(err));
