"use client";

import { useState } from "react";

type Props = {
  title: string;
  coverUrl: string | null;
  className?: string;
};

export function BookCover({ title, coverUrl, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const showFallback = !coverUrl || failed;

  return (
    <div
      className={`relative overflow-hidden rounded-md bg-bg-elev ${className}`}
      style={{ aspectRatio: "2 / 3" }}
    >
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-elev to-bg-base p-3 text-center">
          <span className="line-clamp-4 font-serif text-xs leading-tight text-fg-muted">
            {title}
          </span>
        </div>
      ) : (
        <img
          src={coverUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
