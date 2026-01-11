"use client";

import { useAppSelector } from "@/redux/hooks";
import toast from "react-hot-toast";

export default function CancelSubscriptionButton() {
  const { uid } = useAppSelector((state) => state.user);

  const handleCancel = async () => {
    if (!uid) {
      toast.error("Please log in first.");
      return;
    }

    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      toast.success("Subscription canceled successfully.");
    } catch {
      toast.error("Failed to cancel subscription.");
    }
  };

  return (
    <button
      onClick={handleCancel}
      className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
    >
      Cancel Subscription
    </button>
  );
}
