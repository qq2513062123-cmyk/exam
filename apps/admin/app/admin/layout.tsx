import AdminChrome from "../../components/AdminChrome";
import RouteGuard from "../../components/RouteGuard";

export default function AdminAreaLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteGuard>
      <AdminChrome>{children}</AdminChrome>
    </RouteGuard>
  );
}
