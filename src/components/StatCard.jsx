// Module 4: CSS-in-JS (style objects) + Props
const styles = {
  box: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 4px 14px rgba(15,23,42,0.08)",
    borderLeft: "6px solid",
  },
  value: { fontSize: "2rem", fontWeight: 800, margin: 0 },
  label: { color: "#64748b", margin: 0 },
};

function StatCard({ label, value, color = "#1d4ed8" }) {
  return (
    <div style={{ ...styles.box, borderLeftColor: color }}>
      <p style={{ ...styles.value, color }}>{value}</p>
      <p style={styles.label}>{label}</p>
    </div>
  );
}

export default StatCard;