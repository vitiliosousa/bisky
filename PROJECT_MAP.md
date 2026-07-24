# Project Map

> Fonte de verdade sobre onde as coisas estão nesta aplicação.
> Consulte antes de criar; atualize depois de qualquer mudança estrutural.

## Páginas & Rotas

| Página | Rota | Caminho do ficheiro | Descrição |
|--------|------|----------------------|-----------|
| Landing | / | app/page.tsx | Redireciona para /dashboard |
| Login | /login | app/login/page.tsx | Formulário de login |
| Dashboard | /dashboard | app/(app)/dashboard/page.tsx | Visão geral do negócio |
| Produtos | /produtos | app/(app)/produtos/page.tsx | Lista de produtos |
| Produto detalhe | /produtos/[id] | app/(app)/produtos/[id]/page.tsx | Detalhe do produto |
| Produto editar | /produtos/[id]/editar | app/(app)/produtos/[id]/editar/page.tsx | Editar produto |
| Produto novo | /produtos/novo | app/(app)/produtos/novo/page.tsx | Criar produto |
| Clientes | /clientes | app/(app)/clientes/page.tsx | Lista de clientes |
| Cliente detalhe | /clientes/[id] | app/(app)/clientes/[id]/page.tsx | Detalhe do cliente |
| Cliente editar | /clientes/[id]/editar | app/(app)/clientes/[id]/editar/page.tsx | Editar cliente |
| Cliente novo | /clientes/novo | app/(app)/clientes/novo/page.tsx | Criar cliente |
| Pedidos | /pedidos | app/(app)/pedidos/page.tsx | Lista de pedidos |
| Pedido detalhe | /pedidos/[id] | app/(app)/pedidos/[id]/page.tsx | Detalhe do pedido |
| Pedido editar | /pedidos/[id]/editar | app/(app)/pedidos/[id]/editar/page.tsx | Editar pedido |
| Pedido novo | /pedidos/novo | app/(app)/pedidos/novo/page.tsx | Criar pedido |
| Ingredientes | /ingredientes | app/(app)/ingredientes/page.tsx | Lista de ingredientes |
| Ingrediente detalhe | /ingredientes/[id] | app/(app)/ingredientes/[id]/page.tsx | Detalhe do ingrediente |
| Ingrediente editar | /ingredientes/[id]/editar | app/(app)/ingredientes/[id]/editar/page.tsx | Editar ingrediente |
| Ingrediente novo | /ingredientes/novo | app/(app)/ingredientes/novo/page.tsx | Criar ingrediente |
| Materiais | /materiais | app/(app)/materiais/page.tsx | Lista de materiais |
| Material detalhe | /materiais/[id] | app/(app)/materiais/[id]/page.tsx | Detalhe do material |
| Material editar | /materiais/[id]/editar | app/(app)/materiais/[id]/editar/page.tsx | Editar material |
| Material novo | /materiais/novo | app/(app)/materiais/novo/page.tsx | Criar material |
| Perdas | /perdas | app/(app)/perdas/page.tsx | Lista de perdas |
| Perda detalhe | /perdas/[id] | app/(app)/perdas/[id]/page.tsx | Detalhe da perda |
| Perda novo | /perdas/novo | app/(app)/perdas/novo/page.tsx | Registar perda |
| Calendário | /calendario | app/(app)/calendario/page.tsx | Eventos e entregas |
| Caixa | /caixa | app/(app)/caixa/page.tsx | Fluxo de caixa |
| Caixa detalhe | /caixa/[id] | app/(app)/caixa/[id]/page.tsx | Detalhe do movimento |
| Caixa editar | /caixa/[id]/editar | app/(app)/caixa/[id]/editar/page.tsx | Editar movimento |
| Caixa novo | /caixa/novo | app/(app)/caixa/novo/page.tsx | Registar movimento |
| Contas a pagar | /contas-pagar | app/(app)/contas-pagar/page.tsx | Lista de contas |
| Conta detalhe | /contas-pagar/[id] | app/(app)/contas-pagar/[id]/page.tsx | Detalhe da conta |
| Conta editar | /contas-pagar/[id]/editar | app/(app)/contas-pagar/[id]/editar/page.tsx | Editar conta |
| Conta nova | /contas-pagar/novo | app/(app)/contas-pagar/novo/page.tsx | Criar conta |
| Relatórios | /relatorios | app/(app)/relatorios/page.tsx | Relatórios e análises |
| Negócio | /negocio | app/(app)/negocio/page.tsx | Configurações do negócio |
| Perfil | /perfil | app/(app)/perfil/page.tsx | Perfil do utilizador |
| Perfil editar | /perfil/editar | app/(app)/perfil/editar/page.tsx | Editar perfil |
| Notificações | /notificacoes | app/(app)/notificacoes/page.tsx | Notificações |
| Calculadoras | /calculadoras | app/(app)/calculadoras/page.tsx | Hub com todas as calculadoras |
| Calc. custo/unidade | /calculadoras/custo-por-unidade | app/(app)/calculadoras/custo-por-unidade/page.tsx | Custo por unidade produzida |
| Calc. escalar | /calculadoras/escalar-receita | app/(app)/calculadoras/escalar-receita/page.tsx | Escalar ingredientes para outra quantidade |
| Calc. preço venda | /calculadoras/preco-de-venda | app/(app)/calculadoras/preco-de-venda/page.tsx | Preço de venda com margem desejada |
| Calc. equilíbrio | /calculadoras/ponto-de-equilibrio | app/(app)/calculadoras/ponto-de-equilibrio/page.tsx | Ponto de equilíbrio mensal |

## Tabelas (Prisma)

| Tabela | Para que serve |
|--------|----------------|
| User | Utilizadores da aplicação (email + passwordHash) |
| PerfilUtilizador | Dados de perfil do utilizador (nome, negócio, telefone, etc.) |
| Produto | Produtos/bolos com receita, preço e modo de preparo |
| Ingrediente | Ingredientes com stock atual, mínimo e preço de compra |
| Material | Materiais de embalagem e decoração |
| Cliente | Clientes com nome, telefone e endereço |
| Pedido | Encomendas com itens, valor, estado e data de entrega |
| MovimentoCaixa | Entradas e saídas de caixa |
| ContaPagar | Contas a pagar a fornecedores |
| EventoCalendario | Eventos e entregas no calendário |
| Perda | Registo de desperdícios de ingredientes ou produtos |
