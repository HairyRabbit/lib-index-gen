import * as yargs from "yargs";
import render from "./index";
export default function cli(args: string[] = process.argv.slice(2)): void {
  yargs
    .strict()
    .command(
      "* [entry] [...options]",
      "",
      yargs => {
        return yargs
          .positional("entry", { type: "string", demandOption: "true", default: 'src' })
          .option("dryrun", { type: "boolean" });
      },
      args => {
        const { _, $0, entry, ...options } = args;
        render(entry, options);
      }
    )
    .help()
    .alias("help", "h")
    .version()
    .parse(args);
}
