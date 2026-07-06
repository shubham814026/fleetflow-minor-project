import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { LuSearch, LuSlidersHorizontal } from 'react-icons/lu';
import useDebounce from '../../hooks/useDebounce';
import Card from './Card';

const Table = ({
  title,
  description,
  columns,
  rows,
  getRowId,
  searchKeys = [],
  loading,
  filters,
  pageSize = 8
}) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 300);

  const filteredRows = useMemo(() => {
    if (!debouncedQuery.trim()) return rows;
    const normalized = debouncedQuery.toLowerCase();
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(normalized))
    );
  }, [rows, searchKeys, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <Card className="overflow-hidden p-0" glow>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fleet-tan/60 p-4 dark:border-slate-700/70">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="h-10 w-64 rounded-xl border border-fleet-tan/70 bg-fleet-cream/80 pl-9 pr-3 text-sm outline-none transition focus:border-fleet-oxford dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-fleet-tanVivid"
              placeholder="Search records..."
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
            />
          </div>
          {filters && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                <LuSlidersHorizontal />
              </span>
              {filters}
            </motion.div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/80" />
          ))}
        </div>
      ) : pageRows.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No records found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting filters or search text.</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100/90 text-left text-slate-600 backdrop-blur dark:bg-slate-800/90 dark:text-slate-300">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-4 py-3 font-medium">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {pageRows.map((row) => (
                  <motion.tr
                    key={getRowId(row)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="border-t border-fleet-tan/50 transition hover:bg-fleet-tan/20 dark:border-slate-700/60 dark:hover:bg-slate-800/70"
                  >
                    {columns.map((column) => (
                      <td key={`${getRowId(row)}-${column.key}`} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-fleet-tan/60 p-4 text-xs text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
        <span>
          Showing {pageRows.length} of {filteredRows.length} records
        </span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-300 px-2 py-1 disabled:opacity-50 dark:border-slate-700"
            disabled={safePage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </button>
          <span>
            {safePage} / {totalPages}
          </span>
          <button
            className="rounded-lg border border-slate-300 px-2 py-1 disabled:opacity-50 dark:border-slate-700"
            disabled={safePage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Table;
