'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/common/components/ui/dialog';

interface TimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export default function TimelineModal({ open, onOpenChange, title, children }: TimelineModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[40%] max-h-[80%] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-scroll">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
