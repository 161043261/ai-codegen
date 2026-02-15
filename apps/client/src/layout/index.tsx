import { Outlet } from "react-router";
import GlobalFooter from "@/components/global-footer";
import GlobalHeader from "@/components/global-header";

export default function BasicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <GlobalHeader />
      <main className="m-0 w-full flex-1 bg-transparent p-0">
        <Outlet />
      </main>
      <GlobalFooter />
    </div>
  );
}
