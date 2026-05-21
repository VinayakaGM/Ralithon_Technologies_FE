export const formatDate = (
  date: string | Date | null | undefined,
  includeTime = false
) => {
  if (!date) return "N/A";

  let parsedDate: Date;

  // Handle backend format: "06:55:06 21-05-2026"
  if (typeof date === "string" && date.includes(" ")) {
    const [time, datePart] = date.split(" ");
    const [day, month, year] = datePart.split("-");

    parsedDate = new Date(`${year}-${month}-${day}T${time}`);
  } else {
    parsedDate = new Date(date);
  }

  if (isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  }).format(parsedDate);
};