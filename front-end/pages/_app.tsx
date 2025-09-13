// pages/_app.tsx
import Sidebar from "../components/sidebar";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "20px" }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;
