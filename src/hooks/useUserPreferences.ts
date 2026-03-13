"use client";

import { useState, useEffect } from "react";

export type AvatarId = "eren" | "mikasa" | "armin" | "default";

export function useUserPreferences() {
  const [avatarId, setAvatarId] = useState<AvatarId>("default");

  useEffect(() => {
    const saved = localStorage.getItem("user-avatar-id");
    if (saved && (saved === "eren" || saved === "mikasa" || saved === "armin" || saved === "default")) {
      setAvatarId(saved as AvatarId);
    }
  }, []);

  const changeAvatar = (id: AvatarId) => {
    setAvatarId(id);
    localStorage.setItem("user-avatar-id", id);
  };

  const avatarUrl = avatarId === "default" ? "/avatar.png" : `/avatars/${avatarId}.png`;

  return {
    avatarId,
    avatarUrl,
    changeAvatar
  };
}
