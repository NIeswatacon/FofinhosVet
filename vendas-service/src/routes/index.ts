import { Router, Request, Response } from "express";
import produtoRoute from "./produtoRoute";
import carrinhoRoute from "./carrinhoRoute";

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('API de Vendas está operacional!');
});

router.use('/produtos', produtoRoute);
router.use('/carrinho', carrinhoRoute);

export { router };