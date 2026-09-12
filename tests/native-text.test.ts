/// <reference types="node" />
import { describe, expect, it } from "vitest";
import ts from "typescript";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function rawNativeText(source: string) {
  const file = ts.createSourceFile(
    "screen.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const found: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const tag = ts.isJsxElement(node)
        ? node.openingElement.tagName.getText(file)
        : "fragment";
      if (!["T", "Text", "Animated.Text"].includes(tag)) {
        for (const child of node.children) {
          if (ts.isJsxText(child) && child.text.trim())
            found.push(child.text.trim());
          if (
            ts.isJsxExpression(child) &&
            child.expression &&
            (ts.isStringLiteral(child.expression) ||
              ts.isNumericLiteral(child.expression))
          )
            found.push(child.expression.getText(file));
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return found;
}
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : entry.name.endsWith(".tsx")
        ? [join(dir, entry.name)]
        : [],
  );
}
describe("Native text rendering", () => {
  it("detects an explicit space in a footer fragment", () =>
    expect(rawNativeText('<Screen footer={<>{" "}<Button /></>} />')).toEqual([
      '" "',
    ]));
  it("allows text inside native text primitives", () =>
    expect(rawNativeText('<View><T>Hello {" "}world</T></View>')).toEqual([]));
  it.each(files("src"))(
    "does not put literal text outside Text in %s",
    (file) => expect(rawNativeText(readFileSync(file, "utf8"))).toEqual([]),
  );
});
