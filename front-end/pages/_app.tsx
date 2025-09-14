// pages/_app.tsx
import Sidebar from "../components/sidebar";
import "../styles/globals.css";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // ✅ hide sidebar on /authPage
 const hideSidebar = ["/authPage", "/employer/dashboard"].includes(router.pathname);

  return (
    <div style={{ display: "flex" }}>
      {!hideSidebar && <Sidebar />}
      <main style={{ flex: 1, padding: "20px" }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;
