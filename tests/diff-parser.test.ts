import { DiffParser } from '../src/diff-parser';
import { DiffParsingError } from '../src/errors';

describe('DiffParser', () => {
  it('should parse added lines', () => {
    const diff = '+new line\n regular line\n+another new line';
    const changes = DiffParser.parse(diff);

    expect(changes).toHaveLength(2);
    expect(changes[0].type).toBe('add');
    expect(changes[0].content).toBe('new line');
  });

  it('should parse deleted lines', () => {
    const diff = '-deleted line\n regular line\n-another deleted line';
    const changes = DiffParser.parse(diff);

    expect(changes).toHaveLength(2);
    expect(changes[0].type).toBe('delete');
    expect(changes[0].content).toBe('deleted line');
  });

  it('should handle empty diffs', () => {
    const changes = DiffParser.parse('');
    expect(changes).toHaveLength(0);
  });

  it('should handle mixed changes', () => {
    const diff = '+added\n-removed\n regular\n+new\n-old';
    const changes = DiffParser.parse(diff);

    expect(changes).toHaveLength(4);
    expect(changes[0].type).toBe('add');
    expect(changes[1].type).toBe('delete');
  });

  it('should handle special characters in diff content', () => {
    const diff = '+const π = 3.14;\n-let μ = 0.5;\n regular line\n+const → = "arrow"';
    const changes = DiffParser.parse(diff);

    expect(changes).toHaveLength(3);
    expect(changes[0].content).toBe('const π = 3.14;');
    expect(changes[1].content).toBe('let μ = 0.5;');
    expect(changes[2].content).toBe('const → = "arrow"');
  });

  it('should handle large diffs', () => {
    const largeDiff = Array(1000).fill('+new line').join('\n');
    const changes = DiffParser.parse(largeDiff);
    expect(changes).toHaveLength(1000);
  });

  it('should handle multiline changes', () => {
    const diff = '+function foo() {\n+  return true;\n+}\n-old function';
    const changes = DiffParser.parse(diff);

    expect(changes).toHaveLength(4);
    expect(changes[0].content).toBe('function foo() {');
    expect(changes[1].content).toBe('  return true;');
    expect(changes[2].content).toBe('}');
  });

  it('should throw DiffParsingError for invalid diff', () => {
    expect(() => DiffParser.parse(null as any)).toThrow(DiffParsingError);
  });

  it('should handle malformed diff content', () => {
    const malformedDiff = '+ missing space\n- missing space\nrandom line';
    const changes = DiffParser.parse(malformedDiff);
    expect(changes).toHaveLength(0);
  });
});