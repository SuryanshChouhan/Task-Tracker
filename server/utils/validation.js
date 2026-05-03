const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(value) {
  return emailRegex.test(String(value || "").toLowerCase());
}

function isFutureDate(value) {
  if (!value) {
    return false;
  }

  const input = new Date(value);
  if (Number.isNaN(input.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return input > today;
}

function isValidDate(value) {
  if (!value) {
    return false;
  }

  const input = new Date(value);
  return !Number.isNaN(input.getTime());
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
}

function isValidEnum(value, allowed) {
  return allowed.includes(value);
}

module.exports = { isEmail, isFutureDate, isValidDate, normalizeArray, isValidEnum };
