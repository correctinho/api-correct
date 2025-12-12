import jwt from 'jsonwebtoken';

type TokenType = 'email_validation' | 'password_reset';

interface ITokenPayload {
  sub: string;
  type: TokenType;
  // Removemos o iat opcional
}

export const generateActionToken = (userUuid: string, type: TokenType): string => {
  const secret = process.env.SECRET_KEY_TOKEN_APP_USER;

  if (!secret) {
    throw new Error("Critical: SECRET_KEY_TOKEN_APP_USER is not defined in .env");
  }

  // Payload simples, sem forçar tempo
  const payload: ITokenPayload = {
    sub: userUuid,
    type: type
  };

  // A biblioteca jwt usará a hora atual do sistema automaticamente
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};