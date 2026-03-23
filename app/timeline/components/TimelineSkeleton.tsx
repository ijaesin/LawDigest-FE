import { Loader2 } from 'lucide-react';

export default function TimelineSkeleton() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
    </div>
  );
}
