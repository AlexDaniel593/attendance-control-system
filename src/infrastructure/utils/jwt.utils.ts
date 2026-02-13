import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';

export interface JWTPayload {
  ci: string;
  nombres: string;
  apellidos: string;
  correo: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifica un token JWT
 * @param token - Token JWT a verificar
 * @returns Payload decodificado del token
 * @throws Error si el token es inválido o ha expirado
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw new Error('Error al verificar token');
  }
}

/**
 * Extrae el token del header Authorization
 * @param authHeader - Header de autorización (formato: "Bearer <token>")
 * @returns Token extraído
 * @throws Error si el formato es inválido
 */
export function extractTokenFromHeader(authHeader: string | null): string {
  if (!authHeader) {
    throw new Error('No se proporcionó token de autorización');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Formato de token inválido. Use: Bearer <token>');
  }

  return parts[1];
}

/**
 * Middleware para verificar autenticación
 * Uso en API routes del orquestador:
 * 
 * const authHeader = request.headers.get('authorization');
 * const token = extractTokenFromHeader(authHeader);
 * const user = verifyToken(token);
 */
export function authenticateRequest(authHeader: string | null): JWTPayload {
  const token = extractTokenFromHeader(authHeader);
  return verifyToken(token);
}
