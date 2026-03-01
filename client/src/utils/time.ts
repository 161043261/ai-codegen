import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * Format time
 */
export const formatTime = (
  time: string | undefined,
  format = "YYYY-MM-DD HH:mm:ss",
): string => {
  if (!time) return "";
  return dayjs(time).format(format);
};

/**
 * Format relative time
 */
export const formatRelativeTime = (time: string | undefined): string => {
  if (!time) return "";
  return dayjs(time).fromNow();
};

/**
 * Format date
 */
export const formatDate = (time: string | undefined): string => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD");
};
