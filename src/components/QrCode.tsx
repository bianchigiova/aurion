import { useMemo } from "react";
import qrcode from "qrcode-generator";

interface Props {
  value: string;
  size: number;
  /** What the code is, for screen readers. */
  label: string;
}

/**
 * A QR code rendered as inline SVG — computed entirely client-side (no
 * network request to a QR-generating service), so it works offline like the
 * rest of the app. Always black-on-white regardless of app theme: that's
 * the one polarity every scanner is guaranteed to read.
 */
export default function QrCode({ value, size, label }: Props) {
  const modules = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    const rows: boolean[][] = [];
    for (let r = 0; r < count; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < count; c++) row.push(qr.isDark(r, c));
      rows.push(row);
    }
    return rows;
  }, [value]);

  const count = modules.length;
  const cell = size / count;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
    >
      <rect width={size} height={size} fill="#fff" />
      {modules.map((row, r) =>
        row.map((dark, c) =>
          dark ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill="#000"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
