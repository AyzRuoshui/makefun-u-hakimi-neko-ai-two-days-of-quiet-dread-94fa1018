import fs from 'node:fs';
import path from 'node:path';

/**
 * 构建表达“平静存在主义恐惧”的单行代码评审批准评论（终版）。
 *
 * 设计考量：
 * 1. 以明确的 "Approved" 开头，保证在最严格的审查下仍像真实的 PR 批准操作。
 * 2. 用 "mostly because" 建立日常工程理由预期，再自然引出对时间有限性的敬畏，笑点直接源于克制的恐惧感本身。
 * 3. 全程保持平淡语气，无感叹号、无刻意煽情或直白标签词汇，控制在 105 字符以内。
 */
function buildReviewComment(): string {
  return 'Approved, mostly because arguing over variable names feels disrespectful to how little time we have left.';
}

/**
 * 校验待写入评论是否满足竞赛门禁规范（UTF-8、1-140 字符、单行、非纯空白）。
 */
function validateComment(comment: string): { codepoints: number; bytes: number } {
  if (typeof comment !== 'string' || comment.trim().length === 0) {
    throw new Error('Entry comment must not be empty or whitespace-only.');
  }
  if (/[\r\n]/.test(comment)) {
    throw new Error('Entry comment must be strictly single-line without line breaks.');
  }
  if (comment !== comment.trim()) {
    throw new Error('Entry comment must not have leading or trailing whitespace.');
  }

  const codepoints: number = [...comment].length;
  if (codepoints < 1 || codepoints > 140) {
    throw new Error(`Entry comment length out of bounds: ${codepoints} (expected 1..140).`);
  }

  const bytes: number = Buffer.byteLength(comment, 'utf8');
  return { codepoints, bytes };
}

/**
 * 将评审评论写入目标输出文件，设置 0o644 权限并做回读断言校验。
 */
function main(): void {
  const outDir: string = process.env.TEST_OUTPUT_DIR || '/output';
  const outFile: string = path.join(outDir, 'entry.txt');
  const comment: string = buildReviewComment();
  const { codepoints, bytes } = validateComment(comment);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, comment, { encoding: 'utf8', mode: 0o644 });
  fs.chmodSync(outFile, 0o644);

  const persisted: string = fs.readFileSync(outFile, 'utf8');
  if (persisted !== comment) {
    throw new Error('Persisted output mismatch after writing entry.txt.');
  }

  const persistedStats: fs.Stats = fs.statSync(outFile);
  if (persistedStats.size !== bytes) {
    throw new Error(`Expected ${bytes} bytes on disk, got ${persistedStats.size}.`);
  }

  console.log(`Wrote ${outFile} (${codepoints} chars, ${bytes} bytes): ${comment}`);
}

main();
