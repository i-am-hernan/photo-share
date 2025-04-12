import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wedding Photo Upload",
  description: "Upload your wedding photos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Herr+Von+Muellerhoff&family=Roboto:ital,wght@0,100..900;1,100..900&family=Sacramento&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <div className="h-100 w-100 mx-auto flex flex-col items-center -z-10 bg-background min-h-screen">
          <Image
            src="/img/banner.webp"
            alt="Floral decoration left"
            className="object-contain"
            priority
            width={1000}
            height={1000}
            style={{ width: '100%', height: 'auto' }}
          />
          {children}
          <Toaster position="bottom-right" />
        </div>
      </body>
    </html>
  );
}


