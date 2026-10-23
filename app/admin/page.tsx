import AdminDashboard from "@/components/admin-dashboard";

export const metadata = {
  title: "Order dashboard | Friday Restaurant",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
