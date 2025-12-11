import jwt from 'jsonwebtoken';

// Definindo tipos de token para organização futura (ex: recuperação de senha)
type TokenType = 'email_validation' | 'password_reset';

interface ITokenPayload {
  sub: string; // Subject (o UUID do usuário)
  type: TokenType;
}

export const generateActionToken = (userUuid: string, type: TokenType): string => {
  // Usa a chave secreta definida no .env
  const secret = process.env.SECRET_KEY_TOKEN_APP_USER;

  if (!secret) {
    throw new Error("Critical: SECRET_KEY_TOKEN_APP_USER is not defined in .env");
  }

  const payload: ITokenPayload = {
    sub: userUuid,
    type: type
  };

  // Define expiração de 24 horas
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};
