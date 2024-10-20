const admin = require('../firebase-admin');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to request object
    next();
  } catch (error) {
    return res.status(401).send('Unauthorized');
  }
};

module.exports = authenticate;
