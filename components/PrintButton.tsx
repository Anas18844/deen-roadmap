'use client';

export default function PrintButton() {
  return (
    <button className="btn btn--gold" onClick={() => window.print()}>
      طباعة / حفظ PDF
    </button>
  );
}
