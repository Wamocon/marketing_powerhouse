"use client";

import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";

interface InstagramPreviewProps {
  authorName?: string;
  authorAvatarUrl?: string;
  postText: string;
  imageUrl?: string | null;
  hashtags?: string[];
  compact?: boolean;
}

export default function InstagramPreview({
  authorName = "ihr_unternehmen",
  authorAvatarUrl,
  postText,
  imageUrl,
  hashtags = [],
  compact = false,
}: InstagramPreviewProps) {
  const maxCaptionChars = compact ? 120 : 300;
  const displayText =
    postText.length > maxCaptionChars
      ? postText.slice(0, maxCaptionChars) + "… mehr"
      : postText;

  const hashtagLine =
    hashtags.length > 0
      ? hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")
      : "";

  return (
    <div
      style={{
        background: "#000",
        borderRadius: "8px",
        border: "1px solid #262626",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        maxWidth: compact ? "360px" : "100%",
        fontSize: "14px",
        color: "#f5f5f5",
      }}
      role="article"
      aria-label="Instagram post preview"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: authorAvatarUrl
              ? undefined
              : "linear-gradient(135deg, #E4405F, #FCAF45)",
            backgroundImage: authorAvatarUrl ? `url(${authorAvatarUrl})` : undefined,
            backgroundSize: "cover",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "13px",
            border: "2px solid #c13584",
          }}
        >
          {!authorAvatarUrl && authorName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: "#f5f5f5",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {authorName}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "2px",
            color: "#f5f5f5",
          }}
        >
          <span style={{ fontSize: "16px" }}>⋯</span>
        </div>
      </div>

      {/* Image */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#1a1a1a",
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
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
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.3)",
              fontSize: "48px",
            }}
          >
            📷
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 16px 8px",
          gap: "16px",
        }}
      >
        <Heart
          size={24}
          style={{ color: "#f5f5f5", cursor: "default" }}
          aria-hidden="true"
        />
        <MessageCircle
          size={24}
          style={{ color: "#f5f5f5", cursor: "default" }}
          aria-hidden="true"
        />
        <Send
          size={22}
          style={{ color: "#f5f5f5", cursor: "default" }}
          aria-hidden="true"
        />
        <Bookmark
          size={24}
          style={{ color: "#f5f5f5", marginLeft: "auto", cursor: "default" }}
          aria-hidden="true"
        />
      </div>

      {/* Caption */}
      <div style={{ padding: "0 16px 14px" }}>
        <div
          style={{
            fontSize: "14px",
            lineHeight: 1.5,
            color: "#f5f5f5",
            wordBreak: "break-word",
          }}
        >
          <span style={{ fontWeight: 600, marginRight: "6px" }}>
            {authorName}
          </span>
          <span style={{ whiteSpace: "pre-wrap" }}>{displayText}</span>
        </div>
        {hashtagLine && (
          <div
            style={{
              marginTop: "4px",
              color: "#e0f1ff",
              fontSize: "14px",
              lineHeight: 1.4,
            }}
          >
            {hashtagLine}
          </div>
        )}
        <div
          style={{
            fontSize: "10px",
            color: "#8e8e8e",
            marginTop: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.2px",
          }}
        >
          GERADE EBEN
        </div>
      </div>
    </div>
  );
}
