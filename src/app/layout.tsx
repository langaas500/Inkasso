import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Inkasso-hjelp",
  description: "Verktøy og struktur (placeholder)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      {/* Google tag (gtag.js) for Google Ads */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17884170370"
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17884170370');
        `}
      </Script>

      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <SiteHeader />
        <main style={{ flex: 1, padding: "3rem 0" }}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
