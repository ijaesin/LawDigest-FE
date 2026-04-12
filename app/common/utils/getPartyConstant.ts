/**
 * 타입 안전한 정당 상수 조회.
 * `as keyof typeof` 단언 없이 런타임 키 검증 후 값을 반환한다.
 */
export function getPartyConstant<T extends Record<string, string>>(map: T, key: string, fallback = ''): string {
  return key in map ? map[key as keyof T] : fallback;
}
