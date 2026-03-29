import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "EasyTranslate",
  description: "中英翻译工具",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser()

  return (
    <html lang="zh">
      <body>
        <NavBar user={user} />
        {children}
      </body>
    </html>
  );
}
