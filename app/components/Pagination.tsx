"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap animate-fade-in">
      <button
        id="btn-prev-page"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/40 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {Array.from({ length: totalPages }).map((_, idx) => {
        const pageNum = idx + 1;
        return (
          <button
            key={pageNum}
            id={`btn-page-${pageNum}`}
            onClick={() => onPageChange(pageNum)}
            className={`w-10 h-10 rounded-xl text-sm font-bold cursor-pointer transition-all ${
              currentPage === pageNum
                ? "bg-primary text-on-primary shadow-active"
                : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        id="btn-next-page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/40 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:cursor-not-allowed transition-all"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
