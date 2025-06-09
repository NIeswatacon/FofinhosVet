/**
 * Representa o perfil de Administrador, vinculado a um Usuário.
 */
export type Administrador = {
  id_admin: number;
  id_usuario: number;
  cargo?: string | null; // Pode ser opcional ou nulo
  // Adicione aqui outros campos específicos de Administrador, se houver no futuro.
};