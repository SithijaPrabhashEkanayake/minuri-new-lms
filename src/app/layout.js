import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "ICT With Minu - LMS",
  description: "Advanced Learning Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
