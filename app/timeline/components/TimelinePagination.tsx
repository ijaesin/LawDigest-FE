import { Button } from '@/app/common/components/ui/button';
import { IconNext, IconPrev } from '@/public/svgs';

interface TimelinePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function TimelinePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: TimelinePaginationProps) {
  if (totalPages <= 1) return null;

  const goToPrev = () => onPageChange(currentPage > 0 ? currentPage - 1 : totalPages - 1);
  const goToNext = () => onPageChange(currentPage < totalPages - 1 ? currentPage + 1 : 0);

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <Button variant="ghost" size="sm" className="p-0" onClick={goToPrev}>
        <IconPrev />
      </Button>
      <div className="flex gap-1 items-center">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            type="button"
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${currentPage === i ? 'bg-gray-3' : 'bg-gray-1'}`}
            onClick={() => onPageChange(i)}
            aria-label={`${i + 1}페이지로 이동`}
          />
        ))}
      </div>
      <Button variant="ghost" size="sm" className="p-0" onClick={goToNext}>
        <IconNext />
      </Button>
    </div>
  );
}
