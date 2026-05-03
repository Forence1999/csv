import assert from 'assert';
import { describe, it } from 'node:test';
import fs from 'fs';
import path from 'path';

describe('Webview reorder and resize interactions', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'media', 'main.js'), 'utf8');

  it('starts reorder only from preselected header or row-index cells', () => {
    assert.ok(source.includes('startReorderDrag'));
    assert.ok(source.includes('target.classList.contains(\'selected\')'));
    assert.ok(source.includes('!e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && startReorderDrag(target, e)'));
  });

  it('posts reorder messages for columns and rows', () => {
    assert.ok(source.includes("type: 'reorderColumns'"));
    assert.ok(source.includes("type: 'reorderRows'"));
  });

  it('supports drag-resize for columns and rows', () => {
    assert.ok(source.includes('startResizeDrag'));
    assert.ok(source.includes('col-resize'));
    assert.ok(source.includes('row-resize'));
  });

  it('allows column resizing from the right edge of any data cell', () => {
    assert.ok(source.includes('const getColumnCell = cell =>'));
    const resizeStart = source.indexOf('const getResizeEdgeInfo = (target, e) => {');
    const rowResizeStart = source.indexOf('if (isRowIndexCell(target))', resizeStart);
    assert.notStrictEqual(resizeStart, -1);
    assert.notStrictEqual(rowResizeStart, -1);
    const columnResizeSection = source.slice(resizeStart, rowResizeStart);
    assert.ok(columnResizeSection.includes('const columnCell = getColumnCell(target);'));
    assert.ok(columnResizeSection.includes('const rightEdgeDelta = columnCell.rect.right - e.clientX;'));
    assert.ok(!columnResizeSection.includes('isColumnHeaderCell(target)'));
  });

  it('resets resized column/row on edge double-click', () => {
    assert.ok(source.includes('getResizeEdgeInfo'));
    assert.ok(source.includes('table.addEventListener(\'dblclick\''));
    assert.ok(source.includes('resetColumnWidth(edge.index)'));
    assert.ok(source.includes('resetRowHeight(edge.index)'));
  });
});
