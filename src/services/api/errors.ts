import type { ApiErrorBody, ValidationErrorDetail } from "@/types/api";
import { isAxiosError } from "axios";

export function parseApiError(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function isValidationError(
  detail: ApiErrorBody["detail"],
): detail is ValidationErrorDetail[] {
  return Array.isArray(detail);
}
