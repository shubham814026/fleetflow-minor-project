export const rbacMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User role context missing'
        }
      });
    }

    const userRole = req.user.role;
    // Standardize role strings
    const normalizedUserRole = userRole.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.replace(/[^a-zA-Z]/g, '').toUpperCase());

    if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(normalizedUserRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Role ${userRole} is forbidden from accessing this resource`
        }
      });
    }

    next();
  };
};

export default rbacMiddleware;
