import { TabsClientChrome } from "./tabs-client-chrome";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto h-dvh w-full max-w-md overflow-hidden bg-black">
      <TabsClientChrome>{children}</TabsClientChrome>
    </div>
  );
}
