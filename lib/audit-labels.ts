export const ACTION_LABELS: Record<string, string> = {
  "user.delete": "deleted user",
  "user.restore": "restored user",
  "user.role_change": "changed role for",
  "user.deactivate": "deactivated",
  "user.activate": "activated",
  "user.reset_password": "reset password for",
  "contact.delete": "deleted contact",
  "contact.restore": "restored contact",
  "contact.reassign": "reassigned contact",
  "note.delete": "deleted a note on",
  "note.restore": "restored a note on",
};

export function describeAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}
