import { AuthBrandContent } from '../models/auth-brand.model';

export const LOGIN_BRAND: AuthBrandContent = {
  headline: 'Organize seu dia com clareza.',
  description:
    'Gerencie tarefas, prioridades e metadados em um só lugar — simples, rápido e seguro.',
  features: [
    { icon: 'check_circle', label: 'Sessão segura (HttpOnly + CSRF)' },
    { icon: 'check_circle', label: 'Metadados com tags e prioridade' },
    { icon: 'check_circle', label: 'Sincronizado com a API' },
  ],
};

export const REGISTER_BRAND: AuthBrandContent = {
  headline: 'Comece em segundos.',
  description: 'Crie sua conta gratuita e tenha controle total das suas tarefas e metadados.',
  features: [
    { icon: 'check_circle', label: 'Cadastro rápido' },
    { icon: 'check_circle', label: 'Dados protegidos com bcrypt' },
    { icon: 'check_circle', label: 'Pronto para produção' },
  ],
};
