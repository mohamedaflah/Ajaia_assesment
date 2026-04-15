import { ApiError } from "./ApiError";

export function getUserIdFromReq(req: any): string {
  const userId = req?.user?.userId;
  if (!userId || typeof userId !== "string") throw new ApiError(401, "Unauthorized");
  return userId;
}

