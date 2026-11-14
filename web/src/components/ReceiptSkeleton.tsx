export function ReceiptSkeleton() {
  return <section className="card receipt-skeleton" role="status" aria-busy="true">
    <p className="meta">Pricing your basket...</p>
    {[62, 48, 70, 55, 66, 40].map((width, i) => <div className="receipt-row" key={i}>
      <div className="skeleton-line" style={{ width: width + '%' }} />
      <div className="skeleton-line" style={{ width: '18%' }} />
    </div>)}
  </section>;
}
