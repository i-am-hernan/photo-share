import type { Metadata } from "next";
import { Playfair_Display } from 'next/font/google'
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
const playfairDisplay = Playfair_Display({ weight: '400', subsets: ["latin"] });
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
      </head>
      <body>
        <div className="h-100 w-100 bg-background min-h-screen">
          <div className="relative">
            <Image
              src="/img/banner.webp"
              alt="Floral decoration left"
              className="object-contain"
              priority
              width={1000}
              height={1000}
              style={{ width: '100%', height: '100%' }}
              quality={100}
            />
            <h1 className={`text-[3em] md:text-[3.4em] text-center font-dancingScript relative bottom-10 ${playfairDisplay.className} text-foreground font-thin`}>{`PAULINA & STEVE`}</h1>
          </div>
          {children}
          <Toaster position="bottom-right" />
        </div>
      </body>
    </html>
  );
}


