import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ValueOf } from '@/app/common/types';

export function useTabType<T>(defaultValue: ValueOf<T>): [ValueOf<T>, Dispatch<SetStateAction<ValueOf<T>>>] {
  return useState<ValueOf<T>>(defaultValue);
}
