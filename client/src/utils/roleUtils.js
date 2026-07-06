export const roleHome = {
  'Fleet Manager': '/dashboard',
  Dispatcher: '/trips',
  'Safety Officer': '/maintenance',
  'Financial Analyst': '/analytics'
};

export const canAccess = (role, allowedRoles) => allowedRoles.includes(role);
