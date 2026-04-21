"use client";

import { Globe, MessageCircle, Repeat2, Send, ThumbsUp } from "lucide-react";

interface LinkedInPreviewProps {
  authorName?: string;
  authorHeadline?: string;
  authorAvatarUrl?: string;
  postText: string;
  imageUrl?: string | null;
  hashtags?: string[];
  compact?: boolean;
}

export default function LinkedInPreview({
  authorName = "Ihr Unternehmen",
  authorHeadline = "Marketing · Social Hub",
  authorAvatarUrl,
  postText,
  imageUrl,
  hashtags = [],
  compact = false,
}: LinkedInPreviewProps) {
  const maxPreviewChars = compact ? 200 : 400;
  const displayText =
    postText.length > maxPreviewChars
      ? postText.slice(0, maxPreviewChars) + "…mehr"
      : postText;

  const hashtagLine =
    hashtags.length > 0
      ? hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")
      : "";

  return (
    <div
      style={{
        background: "#1b1f23",
        borderRadius: "8px",
        border: "1px solid #38434f",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        maxWidth: compact ? "360px" : "100%",
        fontSize: "14px",
        color: "rgba(255,255,255,0.9)",
      }}
      role="article"
      aria-label="LinkedIn post preview"
    >
      {/* Author Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          padding: "12px 16px 0",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: authorAvatarUrl ? undefined : "linear-gradient(135deg, #0077B5, #00A0DC)",
            backgroundImage: authorAvatarUrl ? `url(${authorAvatarUrl})` : undefined,
            backgroundSize: "cover",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          {!authorAvatarUrl && authorName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: 1.3,
              color: "rgba(255,255,255,0.95)",
            }}
          >
            {authorName}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {authorHeadline}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "2px",
            }}
          >
            Gerade eben · <Globe size={12} />
          </div>
        </div>
      </div>

      {/* Post Text */}
      <div
        style={{
          padding: "12px 16px",
          fontSize: "14px",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {displayText}
        {hashtagLine && (
          <div
            style={{
              marginTop: "8px",
              color: "#70b5f9",
              fontSize: "14px",
            }}
          >
            {hashtagLine}
          </div>
        )}
      </div>

      {/* Post Image */}
      {imageUrl && (
        <div
          style={{
            width: "100%",
            aspectRatio: "1200 / 628",
            background: "#2d333b",
            overflow: "hidden",
          }}
        >
          <img
            src={imageUrl}
            alt="Post image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Engagement Metrics (mock) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.5)",
          borderBottom: "1px solid #38434f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#378FE9",
              fontSize: "10px",
            }}
          >
            👍
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#E7413E",
              fontSize: "10px",
              marginLeft: "-4px",
            }}
          >
            ❤️
          </span>
        </div>
        <span>0 Kommentare · 0 Reposts</span>
      </div>

      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "4px 8px",
        }}
      >
        {[
          { icon: ThumbsUp, label: "Gefällt mir" },
          { icon: MessageCircle, label: "Kommentieren" },
          { icon: Repeat2, label: "Reposten" },
          { icon: Send, label: "Senden" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "12px 8px",
              border: "none",
              background: "none",
              cursor: "default",
              color: "rgba(255,255,255,0.6)",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "4px",
            }}
            tabIndex={-1}
            aria-hidden="true"
          >
            <Icon size={16} />
            {!compact && label}
          </button>
        ))}
      </div>
    </div>
  );
}
