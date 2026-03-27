import "./globals.css";

export const metadata = {
  title: "PolyLog Relay Admin",
  description: "Privacy-safe administration for PolyLog relay servers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
