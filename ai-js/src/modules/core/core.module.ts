import { Module } from "@nestjs/common";
import { HtmlCodeParser } from "./parser/html-code-parser";
import { MultiFileCodeParser } from "./parser/multi-file-code-parser";
import { CodeParserExecutor } from "./parser/code-parser-executor";
import { HtmlCodeFileSaver } from "./saver/html-code-file-saver";
import { MultiFileCodeFileSaver } from "./saver/multi-file-code-file-saver";
import { CodeFileSaverExecutor } from "./saver/code-file-saver-executor";

@Module({
  providers: [
    HtmlCodeParser,
    MultiFileCodeParser,
    CodeParserExecutor,
    HtmlCodeFileSaver,
    MultiFileCodeFileSaver,
    CodeFileSaverExecutor,
  ],
  exports: [
    HtmlCodeParser,
    MultiFileCodeParser,
    CodeParserExecutor,
    HtmlCodeFileSaver,
    MultiFileCodeFileSaver,
    CodeFileSaverExecutor,
  ],
})
export class CoreModule {}
