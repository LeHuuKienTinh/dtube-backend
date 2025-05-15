const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret';

exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    req.userId = decoded.id;
    req.userType = decoded.type;
    next();
  });
};

// Chặn người bị ban
exports.isNotBanned = (req, res, next) => {
  if (req.userType === '4') {
    return res.status(403).send({ message: 'Your account is banned' });
  }
  next();
};

// Quyền Admin
exports.canAccessAdmin = (req, res, next) => {
  if (req.userType === '1') return next();
  return res.status(403).send({ message: 'Require Admin Role' });
};

// Quyền Home
exports.canAccessHome = (req, res, next) => {
  if (['1', '2'].includes(req.userType)) return next();
  return res.status(403).send({ message: 'Require Home Access' });
};

// Quyền Pay
exports.canAccessPay = (req, res, next) => {
  if (['2', '3'].includes(req.userType)) return next();
  return res.status(403).send({ message: 'Require Pay Access' });
};
