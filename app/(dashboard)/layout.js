import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({ children }) {
  const authed = await verifySession();
  if (!authed) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
