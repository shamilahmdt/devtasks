import React, { useState } from 'react';

export default function MarkdownTableBuilder() {
  // Initialize a 3x3 grid (1 header row + 2 data rows)
  const [tableData, setTableData] = useState([
    ['Header 1', 'Header 2', 'Header 3'],
    ['Cell 1', 'Cell 2', 'Cell 3'],
    ['Cell 4', 'Cell 5', 'Cell 6']
  ]);

  // Track text alignment for each column ('left', 'center', 'right')
  const [columnAlignments, setColumnAlignments] = useState(['left', 'left', 'left']);

  // Handle text change inside any specific cell
  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedData = tableData.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
      }
      return row;
    });
    setTableData(updatedData);
  };

  // Add a new row to the bottom of the table
  const addRow = () => {
    const columnCount = tableData[0].length;
    const newRow = Array(columnCount).fill('');
    setTableData([...tableData, newRow]);
  };

  // Delete a specific row (keeps at least the header row)
  const deleteRow = (rowIndex) => {
    if (tableData.length <= 1) return;
    setTableData(tableData.filter((_, rIdx) => rIdx !== rowIndex));
  };

  // Add a new column to the right side of the table
  const addColumn = () => {
    const updatedData = tableData.map((row, rIdx) => [...row, rIdx === 0 ? `Header ${row.length + 1}` : '']);
    setTableData(updatedData);
    setColumnAlignments([...columnAlignments, 'left']);
  };

  // Delete a specific column (keeps at least 1 column)
  const deleteColumn = (colIndex) => {
    if (tableData[0].length <= 1) return;
    const updatedData = tableData.map(row => row.filter((_, cIdx) => cIdx !== colIndex));
    setTableData(updatedData);
    setColumnAlignments(columnAlignments.filter((_, cIdx) => cIdx !== colIndex));
  };

  // Cycle alignment for a column: Left -> Center -> Right
  const cycleAlignment = (colIndex) => {
    const alignments = ['left', 'center', 'right'];
    const currentIdx = alignments.indexOf(columnAlignments[colIndex]);
    const nextAlignment = alignments[(currentIdx + 1) % alignments.length];
    
    setColumnAlignments(columnAlignments.map((align, cIdx) => cIdx === colIndex ? nextAlignment : align));
  };

  // Generate Markdown Text
  const generateMarkdown = () => {
    if (tableData.length === 0) return '';

    // 1. Generate Header Row
    const headerRow = `| ${tableData[0].join(' | ')} |`;

    // 2. Generate Separator Row with alignments
    const separatorRow = `| ${columnAlignments
      .map((align) => {
        if (align === 'center') return ':---:';
        if (align === 'right') return '---:';
        return ':---';
      })
      .join(' | ')} |`;

    // 3. Generate Data Rows
    const dataRows = tableData
      .slice(1)
      .map((row) => `| ${row.join(' | ')} |`)
      .join('\n');

    return `${headerRow}\n${separatorRow}\n${dataRows}`;
  };

  // Copy Markdown to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMarkdown());
    alert('Markdown copied to clipboard! 📋');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Markdown Table Visual Builder</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Type into the cells and use the dynamic controls to design your Markdown table structure.
          </p>
        </div>
        
        {/* Table Management Actions */}
        <div className="flex flex-wrap gap-2">
          <button onClick={addRow} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow transition">
            + Add Row
          </button>
          <button onClick={addColumn} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow transition">
            + Add Column
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 mb-6">
        <table className="w-full border-collapse">
          <thead>
            {/* Column Control Header Helpers (Alignment & Delete) */}
            <tr className="bg-slate-100 dark:bg-slate-900/80">
              {tableData[0].map((_, colIndex) => (
                <th key={`controls-${colIndex}`} className="p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {/* Alignment Button */}
                    <button 
                      onClick={() => cycleAlignment(colIndex)}
                      title={`Align column ${colIndex + 1}: ${columnAlignments[colIndex]}`}
                      className="p-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:bg-slate-50 uppercase"
                    >
                      {columnAlignments[colIndex] === 'left' && '⬅️ Left'}
                      {columnAlignments[colIndex] === 'center' && '↔️ Center'}
                      {columnAlignments[colIndex] === 'right' && '➡️ Right'}
                    </button>
                    {/* Delete Column Button */}
                    <button 
                      onClick={() => deleteColumn(colIndex)}
                      disabled={tableData[0].length <= 1}
                      title="Delete Column"
                      className="p-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded shadow-sm hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ❌
                    </button>
                  </div>
                </th>
              ))}
              <th className="w-12"></th> {/* Spacer for Row Action column */}
            </tr>

            {/* Main Header Input Row */}
            <tr className="border-b border-slate-200 dark:border-slate-800">
              {tableData[0].map((cellValue, colIndex) => (
                <th key={`header-${colIndex}`} className="p-2">
                  <input
                    type="text"
                    value={cellValue}
                    onChange={(e) => handleCellChange(0, colIndex, e.target.value)}
                    placeholder={`Header ${colIndex + 1}`}
                    style={{ textAlign: columnAlignments[colIndex] }}
                    className="w-full p-2 text-sm font-semibold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-transparent"
                  />
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((row, relativeRowIndex) => {
              const actualRowIndex = relativeRowIndex + 1;
              return (
                <tr key={`row-${actualRowIndex}`} className="border-b border-slate-100 dark:border-slate-900 last:border-0 hover:bg-slate-100/30 dark:hover:bg-slate-900/30">
                  {row.map((cellValue, colIndex) => (
                    <td key={`cell-${actualRowIndex}-${colIndex}`} className="p-2">
                      <input
                        type="text"
                        value={cellValue}
                        onChange={(e) => handleCellChange(actualRowIndex, colIndex, e.target.value)}
                        placeholder="Cell data..."
                        style={{ textAlign: columnAlignments[colIndex] }}
                        className="w-full p-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-transparent"
                      />
                    </td>
                  ))}
                  {/* Row Delete Action Column */}
                  <td className="p-2 text-center w-12">
                    <button
                      onClick={() => deleteRow(actualRowIndex)}
                      disabled={tableData.length <= 2}
                      title="Delete Row"
                      className="p-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Code Export Container */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500">Generated Markdown</span>
          <button 
            onClick={copyToClipboard}
            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded shadow-sm transition"
          >
            Copy Markdown
          </button>
        </div>
        <pre className="p-4 bg-slate-950 text-emerald-400 overflow-x-auto font-mono text-sm leading-relaxed whitespace-pre selection:bg-emerald-900/50 selection:text-white">
          <code>{generateMarkdown()}</code>
        </pre>
      </div>
    </div>
  );
}
