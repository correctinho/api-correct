import winston from 'winston';

// Define cores para desenvolvimento local, ajuda a ler no terminal
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato para DESENVOLVIMENTO LOCAL (Bonito e legível para humanos)
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formato para PRODUÇÃO (Vercel/Container) - JSON Estruturado para máquinas
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  // O json() é o segredo. Ele garante que o log seja uma linha única de JSON.
  // Isso permite que ferramentas como Datadog ou CloudWatch filtrem seus logs facilmente.
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  // Escolhe o formato baseado no ambiente
  format: process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
  transports: [
    // O ÚNICO transporte necessário é o Console.
    // A infraestrutura (Vercel/Docker) cuida de pegar isso e salvar.
    new winston.transports.Console({
      stderrLevels: ['error'], // Manda erros para stderr
    }),
  ],
});

export { logger };