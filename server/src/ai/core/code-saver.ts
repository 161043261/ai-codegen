import * as fs from 'fs';
import * as path from 'path';
import { CodegenType } from '../../common/enums/codegen-type.enum';
import { ParsedCode } from './code-parser';

export class CodeSaver {
  static save(
    parsedCode: ParsedCode,
    appId: string,
    codegenType: CodegenType,
  ): string {
    const outputDir = path.join(
      process.cwd(),
      'tmp',
      'code_output',
      `${codegenType}_${appId}`,
    );
    fs.mkdirSync(outputDir, { recursive: true });

    for (const file of parsedCode.files) {
      const filePath = path.join(outputDir, file.filename);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }

    return outputDir;
  }
}
