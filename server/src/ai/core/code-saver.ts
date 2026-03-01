import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { CodegenType } from '../../common/enums/codegen-type';
import { ParsedCode } from './code-parser';
import { ensureDir } from '../../common/utils/ensure-dir.util';

export class CodeSaver {
  static save(
    parsedCode: ParsedCode,
    appId: string,
    codegenType: CodegenType,
  ): string {
    const outputDir = join(
      process.cwd(),
      'tmp',
      'code_output',
      `${codegenType}_${appId}`,
    );
    ensureDir(outputDir);

    for (const file of parsedCode.files) {
      const filePath = join(outputDir, file.filename);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, file.content, 'utf-8');
    }

    return outputDir;
  }
}
