/*import { Project, SyntaxKind, PropertyAccessExpression } from 'ts-morph';
import * as path from 'path';

const project = new Project({
  tsConfigFilePath: path.resolve('tsconfig.json'),
});

//const sourceFiles = project.getSourceFiles('src/**/
/*
const CONSOLE_METHODS = ['log', 'error', 'warn', 'debug'];

let totalFilesChanged = 0;
let totalReplacements = 0;

for (const sourceFile of sourceFiles) {
  let fileChanged = false;

  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression,
  );

  for (const callExpr of callExpressions) {
    const expr = callExpr.getExpression().asKind(
      SyntaxKind.PropertyAccessExpression,
    );
    if (!expr) continue;

    const expressionText = expr.getExpression().getText();
    const methodName = expr.getName();

    // Solo queremos console.log/error/warn/debug
    if (expressionText !== 'console') continue;
    if (!CONSOLE_METHODS.includes(methodName)) continue;

    // Solo tocamos cosas dentro de clases (servicios, controladores, etc.)
    const classDecl = callExpr.getFirstAncestorByKind(
      SyntaxKind.ClassDeclaration,
    );
    if (!classDecl) continue;

    const className = classDecl.getName() ?? 'AnonymousClass';

    // 1) Asegurar import { Logger } from '@nestjs/common';
    let commonImport = sourceFile
      .getImportDeclarations()
      .find((imp) => imp.getModuleSpecifierValue() === '@nestjs/common');

    if (!commonImport) {
      commonImport = sourceFile.addImportDeclaration({
        moduleSpecifier: '@nestjs/common',
        namedImports: ['Logger'],
      });
    } else {
      const hasLogger = commonImport
        .getNamedImports()
        .some((ni) => ni.getName() === 'Logger');
      if (!hasLogger) {
        commonImport.addNamedImport('Logger');
      }
    }

    // 2) Asegurar propiedad logger en la clase
    const hasLoggerProp = classDecl
      .getInstanceProperties()
      .some((p: any) => p.getName && p.getName() === 'logger');

    if (!hasLoggerProp) {
      classDecl.insertProperty(0, {
        name: 'logger',
        isReadonly: true,
        type: 'Logger',
        initializer: `new Logger(${className}.name)`,
        leadingTrivia: (writer) => writer.writeLine('  // Logger de NestJS'),
      });
    }

    // 3) Reemplazar console.* → this.logger.*
    //    No tocamos el nombre del método porque Logger tiene los mismos: log/error/warn/debug
    expr.getExpression().replaceWithText('this.logger');

    fileChanged = true;
    totalReplacements++;
  }

  if (fileChanged) {
    totalFilesChanged++;
  }
}

project.saveSync();

console.log(`Archivos modificados: ${totalFilesChanged}`);
console.log(`console.* reemplazados: ${totalReplacements}`);



*/