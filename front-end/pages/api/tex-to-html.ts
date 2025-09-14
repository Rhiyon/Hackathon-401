// import type { NextApiRequest, NextApiResponse } from "next";
// import { execa } from "execa";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

//   const { tex } = req.body ?? {};
//   console.log("TEX HEAD:", (tex ?? "").slice(0, 200));
//   if (typeof tex !== "string") return res.status(400).json({ error: "Missing 'tex' string" });


//   try {
//     const { stdout } = await execa("pandoc", [
//       "-f", "latex",
//       "-t", "html",
//       "--mathjax",
//       "-"
//     ], { input: tex, maxBuffer: 10 * 1024 * 1024 });

//     res.status(200).json({ html: stdout });
//   } catch (err: any) {
//     res.status(500).json({ error: err?.shortMessage || err?.message || "pandoc failed" });
//   }
// }

// pages/api/tex-to-html.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { execa } from "execa";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { tex } = (req.body ?? {}) as { tex?: string };
  if (!tex || typeof tex !== "string" || tex.trim() === "") {
    return res.status(400).json({ error: "Missing 'tex' string" });
  }

  try {
    const { stdout } = await execa(
      "pandoc",
      [
        "-f", "latex",   // input: LaTeX
        "-t", "html5",   // output: clean HTML5
        "-",             // read from stdin
      ],
      { input: tex, maxBuffer: 10 * 1024 * 1024, timeout: 30_000 }
    );

    // no need to strip scripts since none are added without --mathjax
    res.status(200).json({ html: stdout });
  } catch (err: any) {
    const message =
      err?.shortMessage || err?.message ||
      (String(err).includes("ENOENT") ? "pandoc not found on PATH" : "pandoc failed");
    return res.status(500).json({ error: message, stderr: err?.stderr?.slice?.(0, 5000) });
  }
}

