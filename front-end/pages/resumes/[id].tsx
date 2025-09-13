// pages/resumes/[id].tsx
import { GetServerSideProps } from "next";
import { useCallback, useState } from "react";

type Resume = {
  resume_id: string;
  child_uid: string;
  parent_uid?: string | null;
  content: string;
  created_at: string;
  updated_at?: string | null;
};

type Props = { resume: Resume | null };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const { id } = ctx.params as { id: string };
  const API_BASE = process.env.API_BASE_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${API_BASE}/resumes/${id}`);
    if (!res.ok) return { props: { resume: null } };
    const resume: Resume = await res.json();
    return { props: { resume } };
  } catch {
    return { props: { resume: null } };
  }
};

export default function ResumePage({ resume }: Props) {
  const [copied, setCopied] = useState(false);
  const apiPublic =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  const onCopy = useCallback(async () => {
    if (!resume) return;
    await navigator.clipboard.writeText(resume.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [resume]);

  const onDownload = useCallback(() => {
    if (!resume) return;
    const blob = new Blob([resume.content], {
      type: "text/x-tex;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${resume.resume_id}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resume]);

  if (!resume) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">
            Resume not found
          </h1>
          <p className="mt-2 text-gray-500">
            The resume you’re looking for doesn’t exist or was removed.
          </p>
        </div>
      </main>
    );
  }

  const created = new Date(resume.created_at).toLocaleDateString();
  const updated = resume.updated_at
    ? new Date(resume.updated_at).toLocaleDateString()
    : null;

  return (
    <main className="mx-auto max-w-5xl p-8 space-y-6 bg-blue-50 min-h-screen">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Resume
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Created: {created}
            {updated ? ` · Updated: ${updated}` : ""}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onCopy}
            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99]"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button
            onClick={onDownload}
            className="rounded-lg bg-purple-600 px-3.5 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700 active:scale-[0.99]"
          >
            Download .tex
          </button>
          <a
            href={`${apiPublic}/resumes/${resume.resume_id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99]"
          >
            View PDF
          </a>
        </div>
      </header>

      {/* LaTeX content */}
      <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-6 font-mono text-[13px] leading-6 text-gray-800 border-0 shadow-sm">
        {resume.content}
      </pre>
    </main>
  );
}
