import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { exportToExcel, exportToPDF, printData, ExportColumn } from '../../utils/export';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  key: string;
  sortable?: boolean;
  exportKey?: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig<T> {
  key: keyof T | string;
  label: string;
  options: FilterOption[];
  filterFn?: (row: T, selectedValue: string) => boolean;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  filterConfigs?: FilterConfig<T>[];
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
  actions?: (row: T) => React.ReactNode;
  exportFilename?: string;
}

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchPlaceholder = 'Cari data...',
  searchFields,
  filterConfigs,
  defaultSortField,
  defaultSortOrder = 'asc',
  actions,
  exportFilename = 'Laporan_LSMS',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<string | null>(defaultSortField || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search term matching
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches = searchFields
          ? searchFields.some((field) => String(row[field] ?? '').toLowerCase().includes(query))
          : Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(query));

        if (!matches) return false;
      }

      // Dropdown filter matching
      if (filterConfigs && filterConfigs.length > 0) {
        for (const config of filterConfigs) {
          const selectedVal = selectedFilters[config.key as string];
          if (selectedVal && selectedVal !== 'ALL') {
            if (config.filterFn) {
              if (!config.filterFn(row, selectedVal)) return false;
            } else {
              if (String(row[config.key as keyof T]) !== selectedVal) return false;
            }
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, searchFields, filterConfigs, selectedFilters]);

  // Sorting Logic
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (fieldKey: string) => {
    if (sortField === fieldKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(fieldKey);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Prepare Export Columns
  const exportColumns: ExportColumn[] = columns.map((col) => ({
    header: col.header,
    key: col.exportKey || col.key,
  }));

  const handleExportExcel = () => {
    exportToExcel(sortedData, exportColumns, exportFilename);
  };

  const handleExportPDF = () => {
    exportToPDF(title, sortedData, exportColumns, exportFilename);
  };

  const handlePrint = () => {
    printData(title, sortedData, exportColumns);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Top Controls Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Dynamic Filters */}
        {filterConfigs && filterConfigs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filterConfigs.map((cfg) => (
              <div key={cfg.key as string} className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedFilters[cfg.key as string] || 'ALL'}
                  onChange={(e) => handleFilterChange(cfg.key as string, e.target.value)}
                  className="bg-white text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua {cfg.label}</option>
                  {cfg.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            title="Export Excel"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            title="Export PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print Data"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 select-none ${
                    col.sortable !== false ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-slate-400">
                        {sortField === col.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                          )
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors text-slate-700">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as any) ?? '-'}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right whitespace-nowrap">{actions(row)}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-slate-400 text-sm"
                >
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-300 bg-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>data dari total {sortedData.length} data</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="font-medium">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
