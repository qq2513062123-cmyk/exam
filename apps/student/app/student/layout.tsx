import RouteGuard from "../../components/RouteGuard";
import StudentChrome from "../../components/StudentChrome";

export default function StudentAreaLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteGuard>
      <StudentChrome>{children}</StudentChrome>
    </RouteGuard>
  );
}
