"use client";

import { useState, useEffect } from "react";

export type AvatarId = "eren" | "mikasa" | "armin" | "default";

const ALLOWED_AVATARS: AvatarId[] = ["default", "eren", "mikasa", "armin"];

export function useUserPreferences() {
  const [avatarId, setAvatarId] = useState<AvatarId>("default");

  useEffect(() => {
    const token = localStorage.getItem("levelup_token");
    const saved = localStorage.getItem("user-avatar-id");

    if (saved && ALLOWED_AVATARS.includes(saved as AvatarId)) {
      setAvatarId(saved as AvatarId);
    }

    fetch("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { user?: { avatarId?: AvatarId } };
        const remoteAvatarId = data.user?.avatarId;
        const localAvatarId =
          saved && ALLOWED_AVATARS.includes(saved as AvatarId) ? (saved as AvatarId) : "default";

        if (remoteAvatarId && ALLOWED_AVATARS.includes(remoteAvatarId)) {
          if (remoteAvatarId === "default" && localAvatarId !== "default") {
            setAvatarId(localAvatarId);
            fetch("/api/auth/me", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ avatarId: localAvatarId }),
            }).catch(() => {
              // Ignore sync failures and keep local preference.
            });
            return;
          }

          setAvatarId(remoteAvatarId);
          localStorage.setItem("user-avatar-id", remoteAvatarId);
        }
      })
      .catch(() => {
        // Keep local preference on network failures.
      });
  }, []);

  const changeAvatar = (id: AvatarId) => {
    setAvatarId(id);
    localStorage.setItem("user-avatar-id", id);

    if (typeof window !== "undefined") {
      const avatarUrl = id === "default" ? "/avatar.png" : `/avatars/${id}.png`;
      window.dispatchEvent(new CustomEvent("avatar-updated", { detail: { avatarId: id, avatarUrl } }));
    }

    const token = localStorage.getItem("levelup_token");
    fetch("/api/auth/me", {
      method: "PATCH",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ avatarId: id }),
    }).catch(() => {
      // Local preference remains if sync fails.
    });
  };

  const avatarUrl = avatarId === "default" ? "/avatar.png" : `/avatars/${avatarId}.png`;

  return {
    avatarId,
    avatarUrl,
    changeAvatar
  };
}
