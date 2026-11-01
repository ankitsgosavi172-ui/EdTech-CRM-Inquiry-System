import { useCallback } from "react";
import toast from "react-hot-toast";

export function useToast() {
  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      toast.success(message, { duration: 3000 });
    } else {
      toast.error(message, { duration: 4000 });
    }
  }, []);

  return { toast: show };
}
