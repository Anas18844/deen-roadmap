'use client';

import { useLayoutEffect, useRef, useState } from 'react';

type Result = { ok: true; message?: string } | { ok: false; error: string };

/**
 * Drag-to-reorder list (mouse and touch via pointer events). Rows slide into place with a FLIP animation;
 * the new order is saved when the row is dropped.
 */
export default function Sortable<T extends { id: string }>({
  items,
  render,
  onSave,
}: {
  items: T[];
  render: (item: T, handle: React.ReactNode) => React.ReactNode;
  onSave: (ids: string[]) => Promise<Result>;
}) {
  const [order, setOrder] = useState(() => items.map((i) => i.id));
  const [dragging, setDragging] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const listRef = useRef<HTMLDivElement>(null);
  const positions = useRef(new Map<string, number>());
  const startOrder = useRef<string[]>([]);

  // keep in sync when the server sends a different list
  const key = items.map((i) => i.id).join(',');
  const lastKey = useRef(key);
  if (lastKey.current !== key) {
    lastKey.current = key;
    setOrder(items.map((i) => i.id));
  }

  const snapshot = () => {
    listRef.current?.querySelectorAll<HTMLElement>('[data-sort-id]').forEach((el) => {
      positions.current.set(el.dataset.sortId!, el.getBoundingClientRect().top);
    });
  };

  // FLIP: animate rows from their previous position to the new one
  useLayoutEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>('[data-sort-id]').forEach((el) => {
      const before = positions.current.get(el.dataset.sortId!);
      if (before === undefined) return;
      const delta = before - el.getBoundingClientRect().top;
      if (!delta) return;
      el.style.transition = 'none';
      el.style.transform = `translateY(${delta}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 180ms ease';
        el.style.transform = '';
      });
    });
  }, [order]);

  function onPointerDown(e: React.PointerEvent, id: string) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startOrder.current = order;
    setDragging(id);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-sort-id]');
    const over = el?.dataset.sortId;
    if (!over || over === dragging || !listRef.current?.contains(el!)) return;
    const rect = el!.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    setOrder((o) => {
      const without = o.filter((x) => x !== dragging);
      const idx = without.indexOf(over) + (after ? 1 : 0);
      const next = [...without.slice(0, idx), dragging, ...without.slice(idx)];
      if (next.join() === o.join()) return o;
      snapshot();
      return next;
    });
  }

  async function onPointerUp() {
    if (!dragging) return;
    setDragging(null);
    if (order.join() === startOrder.current.join()) return;
    setStatus('saving');
    const r = await onSave(order);
    setStatus(r.ok ? 'saved' : 'error');
    if (!r.ok) setOrder(startOrder.current);
    setTimeout(() => setStatus('idle'), 1800);
  }

  const byId = new Map(items.map((i) => [i.id, i]));
  return (
    <div ref={listRef} className="sortable" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      {order.map((id) => {
        const item = byId.get(id);
        if (!item) return null;
        const handle = (
          <button
            type="button"
            className="sortable__handle"
            aria-label="اسحب لتغيير الترتيب"
            title="اسحب لتغيير الترتيب"
            onPointerDown={(e) => onPointerDown(e, id)}
          >
            ⠿
          </button>
        );
        return (
          <div key={id} data-sort-id={id} className={`sortable__row ${dragging === id ? 'sortable__row--drag' : ''}`}>
            {render(item, handle)}
          </div>
        );
      })}
      {status !== 'idle' && (
        <span className={`badge ${status === 'error' ? 'badge--red' : ''}`}>
          {status === 'saving' ? 'جارٍ حفظ الترتيب…' : status === 'saved' ? 'تم حفظ الترتيب ✓' : 'تعذّر حفظ الترتيب'}
        </span>
      )}
    </div>
  );
}
