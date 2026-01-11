import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";
import InitBooks from "./init/InitBooks";
import InitUser from "./init/InitUser";
import ClientLayout from "@/components/layout/ClientLayout";
import { TextSizeProvider } from "@/components/context/TextSizingContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Summarist",
  description: "Gain more knowledge in less time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased overflow-y-auto">
        <Providers>
          <InitBooks />
          <InitUser />

          <TextSizeProvider>
            <ClientLayout>{children}</ClientLayout>
          </TextSizeProvider>

          <Toaster position="top-center" reverseOrder={false} />
        </Providers>
      </body>
    </html>
  );
}
