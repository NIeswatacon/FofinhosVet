/**
 * Representa um usuário genérico no sistema.
 */
export type Usuario = {
  id_usuario: number;
  nome: string;
  cpf: string; // O CPF pode ser opcional ou nulo
  email: string;
  senha: string; // Geralmente, a senha não é exposta, mas incluída para o backend
  numero: string;
  ativo: boolean;
  tipo: 'Tutor' | 'ADMIN'; // Usando maiúsculas para refletir o ENUM do DB
};