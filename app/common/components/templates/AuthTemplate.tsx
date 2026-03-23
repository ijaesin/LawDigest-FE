export interface AuthTemplateProps {
  children: React.ReactNode;
}

export function AuthTemplate({ children }: AuthTemplateProps) {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">{children}</div>;
}
