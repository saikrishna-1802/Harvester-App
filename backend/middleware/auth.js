const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check header format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded; // { id, role }

      // Normalize role to uppercase
      const userRole = decoded.role?.toUpperCase();

      if (roles.length > 0 && !roles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient role' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

module.exports = authMiddleware;
