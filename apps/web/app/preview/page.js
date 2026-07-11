'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LeadPreviewTable from '../components/LeadPreviewTable';

export default function PreviewPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('importResult');

    if (!stored) {
      router.replace('/');
      return;
    }

    try {
      setResult(JSON.parse(stored));
    } catch (err) {
      console.error(err);
      sessionStorage.removeItem('importResult');
      router.replace('/');
    }
  }, [router]);

  if (!result) {
    return null;
  }

  const mappedFields = Object.values(result.mapping || {}).filter(Boolean).length;
  const totalFields = Object.keys(result.mapping || {}).length;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span>✦</span> GrowEasy
        </div>

        <div className="workspace">
          <strong>My workspace</strong>
          <small>Production</small>
        </div>

        <nav>
          <Link href="/">↥ Lead Imports</Link>

          <Link href="/preview" className="active">
            📄 CSV Preview
          </Link>
        </nav>

        <div className="account">
          <b>NT</b>

          <span>
            Workspace admin
            <small>Secure workspace</small>
          </span>
        </div>
      </aside>

      <section className="main">
        <header>
          <div>
            <strong>CSV Preview</strong>
            <small>Review before importing</small>
          </div>
        </header>

        <section className="content">

          <div className="summary">

            <article>
              <small>Total Rows</small>
              <strong>{result.rows ?? 0}</strong>
              <span>Rows uploaded</span>
            </article>

            <article>
              <small>Valid Leads</small>
              <strong>{result.leads?.length ?? 0}</strong>
              <span>Ready for CRM</span>
            </article>

            <article>
              <small>Duplicates</small>
              <strong>{result.duplicates ?? 0}</strong>
              <span>Need review</span>
            </article>

          </div>

          <div className="columns">

            <section className="card result">

              <div>
                <h2>Import Summary</h2>

                <p>
                  {result.leads?.length ?? 0} valid records are ready for import.
                </p>

                <br />

                <p>
                  <strong>Skipped Rows:</strong> {result.skipped ?? 0}
                </p>

                <p>
                  <strong>Mapped Fields:</strong> {mappedFields}/{totalFields}
                </p>
              </div>

              <a
                className="download"
                href={`data:application/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(result.leads || [], null, 2)
                )}`}
                download="groweasy-leads.json"
              >
                Download JSON
              </a>

            </section>

            <aside className="card checks">

              <h2>Validation Summary</h2>

              <div>
                <span>Valid Leads</span>
                <b>{result.leads?.length ?? 0}</b>
              </div>

              <div>
                <span>Skipped Rows</span>
                <b>{result.skipped ?? 0}</b>
              </div>

              <div>
                <span>Duplicates</span>
                <b>{result.duplicates ?? 0}</b>
              </div>

              <div>
                <span>Mapped Fields</span>
                <b>{mappedFields}/{totalFields}</b>
              </div>

            </aside>

          </div>

          <LeadPreviewTable
            leads={result.leads || []}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 30,
            }}
          >

            <button
              className="secondary"
              onClick={() => {
                sessionStorage.removeItem('importResult');
                router.push('/');
              }}
            >
              ← Back to Import
            </button>

            <button
              className="primary"
              onClick={() =>
                alert(
                  `${result.leads?.length ?? 0} leads are ready for CRM import.`
                )
              }
            >
              Import Leads
            </button>

          </div>

        </section>
      </section>
    </main>
  );
}