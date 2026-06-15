export function matchSearch(o, q) {
  const lq = q.toLowerCase();
  return (
    o.code?.toLowerCase().includes(lq) ||
    o.name?.toLowerCase().includes(lq) ||
    o.phone?.includes(lq)
  );
}
