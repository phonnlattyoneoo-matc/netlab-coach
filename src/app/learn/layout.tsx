import type { Metadata } from "next";

const learnUrl = "https://www.netlabcoach.com/learn";

export const metadata: Metadata = {
  alternates: {
    canonical: learnUrl,
  },
  openGraph: {
    url: learnUrl,
  },
};

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
