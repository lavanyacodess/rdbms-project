export function toDateTimeLocal(value) {
  if (!value) return "";
  const date =
    value instanceof Date ? value : new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function currentDateTimeLocal() {
  return toDateTimeLocal(new Date());
}

export function validateEventFields(fields, { requireFuture = true } = {}) {
  const errors = {};
  const eventName = String(fields.event_name || "").trim();
  const description = String(fields.description || "");
  const venue = String(fields.venue || "");

  if (!eventName) {
    errors.event_name = "Event name is required.";
  } else if (eventName.length > 100) {
    errors.event_name = "Event name must be at most 100 characters.";
  }

  if (!fields.event_date) {
    errors.event_date = "Date and time is required.";
  } else {
    const date = new Date(fields.event_date);
    if (Number.isNaN(date.getTime())) {
      errors.event_date = "Enter a valid date and time.";
    } else if (requireFuture && date.getTime() <= Date.now()) {
      errors.event_date = "Choose a future date and time.";
    }
  }

  if (description.trim().length > 2000) {
    errors.description = "Description must be at most 2,000 characters.";
  }

  if (venue.trim().length > 100) {
    errors.venue = "Venue must be at most 100 characters.";
  }

  if (fields.capacity !== "" && fields.capacity !== null && fields.capacity !== undefined) {
    const capacity = Number(fields.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
      errors.capacity = "Capacity must be a whole number between 1 and 10,000.";
    }
  }

  return errors;
}

export function buildEventPayload(fields, extra = {}) {
  return {
    ...extra,
    event_name: String(fields.event_name || "").trim(),
    description: String(fields.description || "").trim() || null,
    event_date: fields.event_date,
    venue: String(fields.venue || "").trim() || null,
    capacity:
      fields.capacity === "" || fields.capacity === null || fields.capacity === undefined
        ? null
        : Number(fields.capacity),
  };
}
