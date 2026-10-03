import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><div><h1 className="text-5xl font-bold text-primary">404</h1><p className="mt-3">페이지를 찾을 수 없습니다.<br/><span className="text-sm text-muted-foreground">Page not found.</span></p><Link to="/" className="mt-6 inline-block text-primary underline">홈으로 / Home</Link></div></div>;
}
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><div><h1 className="text-xl font-semibold">페이지를 불러오지 못했습니다.</h1><p className="mt-2 text-sm text-muted-foreground">This page could not be loaded.</p><button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-primary px-5 py-3 text-primary-foreground">다시 시도 / Try again</button></div></div>;
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Min & Frederik — Wedding Invitation" },
      { name: "description", content: "2027년 10월 10일 서울에서 열리는 Min과 Frederik의 결혼식에 초대합니다." },
      { property: "og:title", content: "Min & Frederik — Wedding Invitation" },
      { property: "og:description", content: "Join us in Seoul on October 10, 2027." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }), shellComponent: RootShell, component: RootComponent, notFoundComponent: NotFoundComponent, errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) { return <html lang="ko"><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() { const { queryClient } = Route.useRouteContext(); return <QueryClientProvider client={queryClient}><Outlet /></QueryClientProvider>; }
