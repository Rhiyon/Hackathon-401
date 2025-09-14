import { GetServerSideProps } from "next";
import { useCallback, useState } from "react";
import { Pencil } from "lucide-react";


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
    const pdfUrl = `${apiPublic}/resumes/${resume.resume_id}/pdf`;
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
        <a
            href="https://www.overleaf.com/project" 
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99]"
        >
        <span>overleaf</span>
        <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
        </a>
        </div>
      </header>
      {/* LaTeX content */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-2">
        <iframe
          src={pdfUrl}
          width="100%"
          height={900}
          style={{ border: "none" }}
          title="Resume PDF"
        />
        </div>
      </section>
    </main>
  );
}