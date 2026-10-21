import { Request, Response, NextFunction } from "express";

export function requireRole(requiredPermissions: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Assegura que req.companyUser existe (o companyIsAuth deve ser chamado antes)
        if (!req.companyUser) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        const { isAdmin, permissions } = req.companyUser;
        
        // Se for admin, tem acesso a tudo
        if (isAdmin) {
            return next();
        }

        // Verifica se tem 'all' (super permissão) ou a permissão específica necessária
        if (permissions && (permissions.includes('all') || requiredPermissions.some(role => permissions.includes(role)))) {
            return next();
        }
        
        return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso.' });
    };
}
