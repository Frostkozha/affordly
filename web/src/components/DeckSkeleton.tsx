export function DeckSkeleton() {
  return <div className="deck-skeleton card" role="status" aria-busy="true">
    <p>Finding meals...</p>
    <div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" />
  </div>;
}
