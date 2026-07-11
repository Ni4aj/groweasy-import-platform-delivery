export default function LeadPreviewTable({ leads = [] }) {
  if (!leads || leads.length === 0) {
    return (
      <section className="card result">
        <h2>CSV Preview</h2>
        <p>No valid leads found.</p>
      </section>
    );
  }

  const previewLeads = leads.slice(0, 10);

  return (
    <section className="card result">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2>CSV Preview</h2>

          <p>
            Showing first <strong>{previewLeads.length}</strong> of{" "}
            <strong>{leads.length}</strong> records
          </p>
        </div>

        <a
          className="download"
          href={`data:application/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(leads, null, 2)
          )}`}
          download="groweasy-leads.json"
        >
          Download JSON
        </a>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={headerStyle}>Full Name</th>
              <th style={headerStyle}>Email</th>
              <th style={headerStyle}>Mobile</th>
              <th style={headerStyle}>City</th>
              <th style={headerStyle}>Status</th>
              <th style={headerStyle}>Source</th>
            </tr>
          </thead>

          <tbody>
            {previewLeads.map((lead, index) => (
              <tr key={index}>
                <td style={cellStyle}>{lead.full_name || "-"}</td>
                <td style={cellStyle}>{lead.email || "-"}</td>
                <td style={cellStyle}>{lead.mobile || "-"}</td>
                <td style={cellStyle}>{lead.city || "-"}</td>
                <td style={cellStyle}>{lead.crm_status || "-"}</td>
                <td style={cellStyle}>{lead.data_source || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length > 10 && (
        <p
          style={{
            marginTop: 20,
            color: "#666",
            fontSize: 14,
          }}
        >
          Showing the first 10 records. Download the JSON file to view all{" "}
          {leads.length} leads.
        </p>
      )}
    </section>
  );
}

const headerStyle = {
  border: "1px solid #e5e7eb",
  padding: "12px",
  background: "#f8fafc",
  fontWeight: "600",
  textAlign: "left",
};

const cellStyle = {
  border: "1px solid #e5e7eb",
  padding: "10px",
  textAlign: "left",
};