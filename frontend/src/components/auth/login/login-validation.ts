export function emailErrorMessage(email: string): string | null {
  const t = email.trim();
  if (!t) return "Enter your work email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function passwordErrorMessage(password: string): string | null {
  if (!password) return "Enter your password.";
  if (password.length < 8) return "Use at least 8 characters.";
  return null;
}

/** Stricter rule for new accounts (industry baseline). */
export function newPasswordErrorMessage(password: string): string | null {
  if (!password) return "Create a password.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 128) return "Password is too long.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include at least one letter and one number.";
  }
  return null;
}

export function confirmPasswordErrorMessage(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) return "Confirm your password.";
  if (confirm !== password) return "Passwords must match.";
  return null;
}

export function fullNameErrorMessage(name: string): string | null {
  const t = name.trim();
  if (!t) return "Enter your full name.";
  if (t.length < 2) return "Enter a valid name.";
  if (t.length > 120) return "Name is too long.";
  return null;
}
