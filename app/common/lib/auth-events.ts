// Client-side auth event bus. On server, it's a no-op.

type AuthEventType = 'auth:logout' | 'auth:token-reissued';

let authEventTarget: EventTarget | undefined;

const getTarget = (): EventTarget | null => {
  if (typeof window === 'undefined') return null;
  if (!authEventTarget) {
    authEventTarget = new EventTarget();
  }
  return authEventTarget;
};

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
