// Normal şartlar altında yetki sistemi backend'de olup dinamik bir şekilde güncellenmeli ancak geliştirme sürecini uzatmak istemediğim için frontend'de sabit olarak tanımladım.

exports.PBS_VISIBLE_ROLES = [
  "yazi-isleri-muduru",
  "zabit-katibi",
  "zabit-katibi-sozlesmeli",
  "mubasir",
  "mubasir-sozlesmeli",
  "memur",
  "memur-sozlesmeli",
  "user",
  "infazvekorumamemuru",
  "infazvekorumamemuru-sozlesmeli",
  "admin",
];

exports.PBS_ACCESSIBLE_ROLES = [
  "yazi-isleri-muduru",
  "zabit-katibi",
  "zabit-katibi-sozlesmeli",
  "mubasir",
  "mubasir-sozlesmeli",
  "memur",
  "memur-sozlesmeli",
  "user",
  "infazvekorumamemuru",
  "infazvekorumamemuru-sozlesmeli",
  "admin",
];

exports.PYS_VISIBLE_ROLES = ["admin"];

exports.PYS_ACCESSIBLE_ROLES = ["admin"];
