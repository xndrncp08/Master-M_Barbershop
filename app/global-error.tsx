"use client";

import { useEffect } from "react";

/** Last-resort fallback when the root layout itself fails; renders its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-CA" style={{ colorScheme: "dark" }}>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#0b0a08",
          color: "#f5efe2",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <main>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Master M Barbershop</h1>
          <p style={{ color: "#b8ae9b", marginBottom: 24 }}>
            The site hit an unexpected error. Call <a href="tel:+14034755662" style={{ color: "#f2d58c" }}>(403) 475-5662</a> to book.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 48,
              padding: "0 24px",
              borderRadius: 999,
              border: 0,
              background: "#e8c06a",
              color: "#070605",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}
