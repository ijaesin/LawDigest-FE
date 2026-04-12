'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseResponsivePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  currentItems: T[];
  totalPages: number;
  itemsPerPage: number;
}

export function useResponsivePagination<T>(
  items: T[],
  breakpoints: { md?: number; lg?: number } = {},
): UseResponsivePaginationReturn<T> {
  const { md = 2, lg = 3 } = breakpoints;
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(lg);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(md);
      } else {
        setItemsPerPage(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [md, lg]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  // 페이지 범위 초과 시 마지막 페이지로 보정
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  return { currentPage, setCurrentPage, currentItems, totalPages, itemsPerPage };
}
