export default function LeadPreviewTable({ leads = [] }) {
  if (!leads || leads.length === 0) {
    return (
      <section className="card result">
        <p
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          No valid leads found.
        </p>
      </section>
    );
  }

  const previewLeads = leads.slice(0, 10);

  return (
    <section className="card result">
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