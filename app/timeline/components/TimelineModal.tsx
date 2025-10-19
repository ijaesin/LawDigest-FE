'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/common/components/ui/dialog';

export default function TimelineModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-h-[40%] max-h-[80%] flex flex-col">
        <DialogHeader>
          <DialogTitle>심사한 법안</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-scroll">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
