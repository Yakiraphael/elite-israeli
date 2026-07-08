// Quick-contact link builders for chasing missing compliance items with a guardian/player.
export function whatsappLink(player, message) {
  const raw = player.is_adult ? player.phone : (player.parent_phone || player.phone);
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? '972' + digits.slice(1) : digits;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${intl}${text}`;
}

export function mailtoLink(player, subject, body) {
  const email = player.is_adult ? null : player.parent_email;
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}