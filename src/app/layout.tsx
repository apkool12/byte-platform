import type { Metadata } from "next";
import Providers from "@/lib/Providers";
import ClientLayout from "@/components/Layout/ClientLayout";
import { Pinyon_Script } from "next/font/google";

const pinyonScript = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pinyon",
});

export const metadata: Metadata = {
  title: "Byte",
  description: "국립한밭대학교 제 42대 컴퓨터공학과 학생회 페이지입니다.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pinyonScript.variable}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
