export function hasRequiredRole(decodedToken, requiredRoles) {
  if (!decodedToken || !Array.isArray(decodedToken.roles)) {
    return false;
  }
  return decodedToken.roles.some((role) => requiredRoles.includes(role));
}

