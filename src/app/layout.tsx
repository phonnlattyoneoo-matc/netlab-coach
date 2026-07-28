import type { Metadata } from "next";
import "./globals.css";

const productionUrl = "https://www.netlabcoach.com";
const title = "NetLab Coach – AI Networking Study Assistant";
const description =
  "NetLab Coach is an AI-powered study assistant that helps students understand networking labs, troubleshoot errors, upload screenshots, and learn technical concepts step by step.";

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title,
  description,
  alternates: {
    canonical: productionUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: productionUrl,
    siteName: "NetLab Coach",
    title,
    description,
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

const webApplicationStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NetLab Coach",
  url: productionUrl,
  description,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationStructuredData),
          }}
        />
        {children}
        <footer className="border-t border-slate-200 bg-slate-50 px-4 py-4 text-center text-xs leading-5 text-slate-500">
          NetLab Coach is an independent educational tool and is not affiliated
          with NDG or NETLAB+.
        </footer>
      </body>
    </html>
  );
}
