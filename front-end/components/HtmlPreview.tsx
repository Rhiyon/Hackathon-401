// // components/HtmlPreview.tsx
// import { useEffect, useState } from "react";
// import DOMPurify from "isomorphic-dompurify";

// export default function HtmlPreview({ tex }: { tex: string }) {
//   const [html, setHtml] = useState("");

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const r = await fetch("/api/tex-to-html", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ tex }),
//         });
//         const data = await r.json();
//         if (!cancelled && data.html) {
//           setHtml(DOMPurify.sanitize(data.html));
//         }
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [tex]);

//   return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
// }


// components/HtmlPreview.tsx
"use client";
import { useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";

export default function HtmlPreview({ tex }: { tex: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/tex-to-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tex }),
      });
      const data = await r.json();
      console.log("API HTML HEAD:", (data?.html ?? "").slice(0, 200)); // <- should look like normal HTML
      if (data?.html) setHtml(DOMPurify.sanitize(data.html));
    })();
  }, [tex]);

  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}
