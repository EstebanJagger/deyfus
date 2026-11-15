import "./LookerDashboard.css";

export default function LookerDashboard() {
  const url = import.meta.env.VITE_LOOKER_EMBED_URL as string;

  return (
    <section className="looker-section">
      <h2>Analítica empresarial</h2>
      <div className="looker-wrapper">
        <iframe
          title="Dashboard de ventas - Looker Studio"
          src={url}
          loading="lazy"
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </section>
  );
}