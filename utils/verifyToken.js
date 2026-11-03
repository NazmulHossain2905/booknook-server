import { createRemoteJWKSet, jwtVerify } from "jose";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Unauthorize user!",
      data: null,
    });
  }

  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorize user!",
      data: null,
    });
  }

  try {
    const JWKS = createRemoteJWKSet(
      new URL("http://localhost:3000/api/auth/jwks"),
    );
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch (error) {
    console.error("Token validation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Token validation failed",
      error,
      data: null,
    });
  }
};
