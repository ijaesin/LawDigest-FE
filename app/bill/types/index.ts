import { ReactNode } from 'react';
import type { BillResponse } from '@/app/bill/validation';

export interface BillProps extends BillResponse {
  children?: ReactNode;
  detail?: boolean;
  viewCount?: number;
}
