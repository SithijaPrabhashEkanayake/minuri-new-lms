import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
