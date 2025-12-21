/* eslint-disable no-underscore-dangle */
// Client-side auth event bus. On server, it's a no-op.

// 1) Window 전역 프로퍼티 선언으로 타입 오류 제거
declare global {
  interface Window {
    __AUTH_EVENT_TARGET__?: EventTarget;
  }
}

// 2) 안전한 target getter (SSR 환경 대응)
const getTarget = (): EventTarget | null => {
  if (typeof window === 'undefined') return null;
  if (!window.__AUTH_EVENT_TARGET__) {
    window.__AUTH_EVENT_TARGET__ = new EventTarget();
  }
  return window.__AUTH_EVENT_TARGET__;
};

// 3) 이벤트 버스 구현
type AuthEventType = 'auth:logout' | 'auth:token-reissued';

const dispatch = (type: AuthEventType): void => {
  getTarget()?.dispatchEvent(new CustomEvent(type));
};

const subscribe = (type: AuthEventType, listener: () => void): (() => void) => {
  const target = getTarget();
  if (!target) return () => {};
  const handler = () => listener();
  target.addEventListener(type, handler);
  return () => target.removeEventListener(type, handler);
};

export const authEvents = {
  emitLogout: () => dispatch('auth:logout'),
  emitTokenReissued: () => dispatch('auth:token-reissued'),
  onLogout: (listener: () => void) => subscribe('auth:logout', listener),
  onTokenReissued: (listener: () => void) => subscribe('auth:token-reissued', listener),
};
