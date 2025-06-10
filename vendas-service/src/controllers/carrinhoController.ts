import { Request, Response, NextFunction } from 'express';
import type { Carrinho } from '../types/carrinho/carrinho';
import type { ItemCarrinho } from '../types/carrinho/itemCarrinho';
import { pool } from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { ProdutoBase } from '../types/produtos/produtoBase';

// Atualiza o total do carrinho com base nos itens
async function atualizarTotalCarrinho(idCarrinho: number): Promise<number> {
  const [itensResult] = await pool.execute<RowDataPacket[] & { quantidade: number; preco: number }[]>(
    `SELECT ic.quantidade, pb.preco 
     FROM ItemCarrinho ic
     JOIN ProdutoBase pb ON ic.idProduto = pb.id
     WHERE ic.idCarrinho = ?`,
    [idCarrinho]
  );

  const novoTotal = itensResult.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);

  await pool.execute(
    `UPDATE Carrinho SET total = ?, dataUltimaModificacao = NOW() WHERE idCarrinho = ?`,
    [novoTotal, idCarrinho]
  );

  return novoTotal;
}

// Busca detalhes completos do carrinho + itens formatados
async function obterDetalhesCarrinhoFormatado(idCarrinho: number): Promise<{ carrinho: Carrinho | null, itens: any[] }> {
  const [carrinhoRows] = await pool.execute<RowDataPacket[] & Carrinho[]>(
    `SELECT idCarrinho, idUsuario, total, dataCriacao, dataUltimaModificacao 
     FROM Carrinho WHERE idCarrinho = ?`,
    [idCarrinho]
  );

  if (carrinhoRows.length === 0) return { carrinho: null, itens: [] };

  const carrinho = carrinhoRows[0];

  const [itensDB] = await pool.execute<RowDataPacket[]>(
    `SELECT ic.idProduto, ic.quantidade, pb.preco, pb.nome as nome_produto
     FROM ItemCarrinho ic
     JOIN ProdutoBase pb ON ic.idProduto = pb.id 
     WHERE ic.idCarrinho = ?`,
    [idCarrinho]
  );

  const itensFormatados = itensDB.map(item => ({
    idProduto: item.idProduto,
    quantidade: item.quantidade,
    nome: item.nome_produto,
    preco: item.preco
  }));

  return { carrinho, itens: itensFormatados };
}

// GET /carrinho
export const listarProdutosDoCarrinho = async (req: Request, res: Response, next: NextFunction) => {
  const userId = parseInt(req.header("X-User-ID") || "", 10);
  if (isNaN(userId)) return res.status(401).json({ success: false, message: "Usuário não autenticado." });

  try {
    const [carrinhosResult] = await pool.execute<RowDataPacket[]>(
      `SELECT idCarrinho FROM Carrinho WHERE idUsuario = ?`,
      [userId]
    );

    if (carrinhosResult.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Carrinho vazio ou não encontrado para este cliente.',
        data: {
          idUsuario: userId, itens: [], total: 0, idCarrinho: null,
          dataCriacao: null, dataUltimaModificacao: null
        }
      });
    }

    const idCarrinho = carrinhosResult[0].idCarrinho;
    const { carrinho, itens } = await obterDetalhesCarrinhoFormatado(idCarrinho);

    if (!carrinho) return res.status(404).json({ success: false, message: 'Carrinho não encontrado.' });

    res.status(200).json({ success: true, data: { ...carrinho, itens } });

  } catch (err) {
    console.error("Erro ao buscar produtos do carrinho:", err);
    next(err);
  }
};

// POST /carrinho/adicionar
export const adicionarProdutoAoCarrinho = async (req: Request, res: Response, next: NextFunction) => {
  const userId = parseInt(req.header("X-User-ID") || "", 10);
  if (isNaN(userId)) return res.status(401).json({ success: false, message: "Usuário não autenticado." });

  try {
    const { idProduto, quantidade } = req.body;

    if (!idProduto || !quantidade || typeof quantidade !== 'number' || quantidade <= 0) {
      return res.status(400).json({ success: false, message: 'idProduto e quantidade válidos são obrigatórios.' });
    }

    const [rows] = await pool.execute<RowDataPacket[] & ProdutoBase[]>(
      `SELECT id, nome, preco, tipo, descricao FROM ProdutoBase WHERE id = ?`,
      [idProduto]
    );

    const produtoInfo = rows[0];
    if (!produtoInfo) return res.status(404).json({ success: false, message: 'Produto não encontrado.' });

    let idCarrinho: number;
    const [carrinhosResult] = await pool.execute<RowDataPacket[]>(
      `SELECT idCarrinho FROM Carrinho WHERE idUsuario = ?`,
      [userId]
    );

    if (carrinhosResult.length > 0) {
      idCarrinho = carrinhosResult[0].idCarrinho;
    } else {
      const [insertResult] = await pool.execute<ResultSetHeader>(
        `INSERT INTO Carrinho (idUsuario, dataCriacao, dataUltimaModificacao, total) VALUES (?, NOW(), NOW(), 0)`,
        [userId]
      );
      idCarrinho = insertResult.insertId;
    }

    await pool.execute(
      `INSERT INTO ItemCarrinho (idCarrinho, idProduto, quantidade)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantidade = quantidade + VALUES(quantidade)`,
      [idCarrinho, idProduto, quantidade]
    );

    await atualizarTotalCarrinho(idCarrinho);

    const { carrinho: carrinhoAtualizado, itens: itensFormatados } = await obterDetalhesCarrinhoFormatado(idCarrinho);
    if (!carrinhoAtualizado) return res.status(500).json({ success: false, message: 'Erro ao buscar carrinho atualizado.' });

    res.status(200).json({
      success: true,
      message: 'Produto adicionado/atualizado no carrinho!',
      data: { ...carrinhoAtualizado, itens: itensFormatados }
    });

  } catch (err) {
    console.error("Erro ao adicionar produto ao carrinho:", err);
    next(err);
  }
};

// POST /carrinho/remover
export const removerProdutoDoCarrinho = async (req: Request, res: Response, next: NextFunction) => {
  const userId = parseInt(req.header("X-User-ID") || "", 10);
  if (isNaN(userId)) return res.status(401).json({ success: false, message: "Usuário não autenticado." });

  try {
    const { idProduto, quantidade } = req.body;

    if (!idProduto) return res.status(400).json({ success: false, message: 'idProduto é obrigatório.' });

    const [carrinhosResult] = await pool.execute<RowDataPacket[]>(
      `SELECT idCarrinho FROM Carrinho WHERE idUsuario = ?`,
      [userId]
    );

    if (carrinhosResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Carrinho não encontrado.' });
    }

    const idCarrinho = carrinhosResult[0].idCarrinho;

    const [itensCarrinho] = await pool.execute<RowDataPacket[]>(
      `SELECT quantidade FROM ItemCarrinho WHERE idCarrinho = ? AND idProduto = ?`,
      [idCarrinho, idProduto]
    );

    if (itensCarrinho.length === 0) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado no carrinho.' });
    }

    const quantidadeAtual = itensCarrinho[0].quantidade;

    if (!quantidade || quantidade >= quantidadeAtual) {
      await pool.execute(`DELETE FROM ItemCarrinho WHERE idCarrinho = ? AND idProduto = ?`, [idCarrinho, idProduto]);
    } else {
      const novaQuantidade = quantidadeAtual - quantidade;
      await pool.execute(
        `UPDATE ItemCarrinho SET quantidade = ? WHERE idCarrinho = ? AND idProduto = ?`,
        [novaQuantidade, idCarrinho, idProduto]
      );
    }

    await atualizarTotalCarrinho(idCarrinho);

    const { carrinho: carrinhoAtualizado, itens: itensFormatados } = await obterDetalhesCarrinhoFormatado(idCarrinho);
    res.status(200).json({
      success: true,
      message: 'Produto removido/atualizado do carrinho!',
      data: carrinhoAtualizado ? { ...carrinhoAtualizado, itens: itensFormatados } : null
    });

  } catch (err) {
    console.error("Erro ao remover produto do carrinho:", err);
    next(err);
  }
};
