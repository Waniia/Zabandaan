const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET must be set to a random value of at least 32 characters. Copy server/.env.example to server/.env and set it before starting the server.'
  );
}

const PORT = Number(process.env.PORT || 3001);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('PORT must be a valid TCP port number.');
}

module.exports = { JWT_SECRET, PORT };
