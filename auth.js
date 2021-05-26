const jwt = require('jsonwebtoken');
const User = require('./models/user');

const getToken = (req) => {
  let authorization = null;
  let token = null;
  if (req.query && req.query.token) {
    return req.query.token;
  }
  if (req.authorization) {
    authorization = req.authorization;
  } else if (req.headers) {
    authorization = req.headers.authorization;
  } else if (req.socket) {
    if (req.socket.handshake.query && req.socket.handshake.query.token) {
      return req.socket.handshake.query.token;
    }
    authorization = req.socket.handshake.headers.authorization;
  }
  if (authorization) {
    const tokens = authorization.split('Bearer ');
    if (Array.isArray(tokens) || tokens.length === 2) {
      [, token] = tokens;
    }
  }
  return token;
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_TOKEN, async (err, data) => {
      if (err) {
        return {
          message: 'Forbidden',
          status: 403,
        };
      } else {
        return await User.findOne({ _id: data.user }).lean();
      }
    });
  } catch (error) {
    throw new Error()
  }
}

exports.auth = () => {
  return async (req, res, next) => {
    try {
      const token = getToken(req);
      if (!token) {
        return res.status(401).json({
          message: 'authentication_is_failure',
          status: 401,
        });
      }
      const user = await verifyToken(token);
      if (user.status && user.status === 403) {
        return res.status(403).json(user);
      }
      req.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}