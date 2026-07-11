'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const input = useRef(null);
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const choose = (chosen) => {
    if (!chosen) return;

    if (!chosen.name.toLowerCase().endsWith('.csv')) {
      return setError('Please choose a CSV file.');
    }

    if (chosen.size > 5 * 1024 * 1024) {
      return setError('The file must be 5 MB or smaller.');
    }

    setFile(chosen);
    setError('');
    setResult(null);
  };

  const importFile = async () => {
    if (!file) {
      return setError('Choose a CSV file first.');
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('file', file);

      const response = await fetch(`${api}/api/upload`, {
        method: 'POST',
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setResult(data);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('importResult', JSON.stringify(data));
      }

      router.push('/preview');
    } catch (e) {
      setError(e.message || 'Could not import the file.');
    } finally {
      setLoading(false);
    }
  };

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
          <a className="active" href="#import">
            ↥ Lead imports
          </a>
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
            <strong>GrowEasy Import Studio</strong>
            <small>CSV lead standardization</small>
          </div>

          <span className="limit">CSV · Max 5 MB</span>
        </header>

        <section className="hero">
          <span className="eyebrow">✦ SMART LEAD INTAKE</span>

          <h1>From messy spreadsheet to CRM-ready leads.</h1>

          <p>
            Upload a CSV once. We detect contact data, standardize valid
            fields, and return a clean GrowEasy import.
          </p>

          <div className="hero-points">
            <span>✓ Contact validation</span>
            <span>✓ AI-ready mapping</span>
            <span>✓ Safe import preview</span>
          </div>
        </section>

        <section id="import" className="content">
          <div className="summary">
            <article>
              <small>Rows detected</small>
              <strong>{result?.rows ?? '—'}</strong>
              <span>From the selected file</span>
            </article>

            <article>
              <small>Valid leads</small>
              <strong>{result?.leads?.length ?? '—'}</strong>
              <span>Email or mobile required</span>
            </article>

            <article>
              <small>Duplicates</small>
              <strong>{result?.duplicates ?? '—'}</strong>
              <span>Flagged for review</span>
            </article>
          </div>

          <div className="columns">
            <section className="card importer">
              <div>
                <h2>Import leads via CSV</h2>
                <p>Only valid leads are prepared for import.</p>
              </div>

              <button
                className="dropzone"
                type="button"
                onClick={() => input.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  choose(e.dataTransfer.files[0]);
                }}
              >
                <input
                  ref={input}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => choose(e.target.files[0])}
                />

                <i>↥</i>

                <b>
                  {file ? file.name : 'Drop your CSV file here'}
                </b>

                <span>
                  {file
                    ? `${Math.ceil(file.size / 1024)} KB selected`
                    : 'or click to browse files'}
                </span>
              </button>

              {error && <p className="error">{error}</p>}

              <div className="actions">
                <button
                  className="secondary"
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setError('');
                  }}
                >
                  Clear
                </button>

                <button
                  className="primary"
                  type="button"
                  disabled={loading || !file}
                  onClick={importFile}
                >
                  {loading ? 'Processing...' : 'Upload & validate'}
                </button>
              </div>
            </section>

            <aside className="card checks">
              <h2>Data checks</h2>

              <div>
                <span>Valid leads</span>
                <b>{result?.leads?.length ?? '—'}</b>
              </div>

              <div>
                <span>Skipped rows</span>
                <b>{result?.skipped ?? '—'}</b>
              </div>

              <div>
                <span>Duplicate contacts</span>
                <b>{result?.duplicates ?? '—'}</b>
              </div>

              <div>
                <span>Mapped fields</span>
                <b>
                  {result
                    ? `${Object.values(result.mapping || {}).filter(Boolean).length}/${Object.keys(result.mapping || {}).length}`
                    : '—'}
                </b>
              </div>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}