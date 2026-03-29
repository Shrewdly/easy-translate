import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "EasyTranslate",
  description: "中英翻译工具",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="zh">
      <body>
        <NavBar user={user} />
        {children}
      </body>
    </html>
  );
}
