# Auditoria de produção — baseline e status atual

**Origem:** auditoria recebida antes da execução das Sprints 0 e 1.  
**Uso:** evitar regressão e distinguir problemas resolvidos do backlog futuro.

## Conclusão atual

A auditoria identificou corretamente riscos críticos de segurança e de
integridade comercial. Esses riscos formaram as Sprints 0 e 1, que já foram
implementadas e verificadas. O projeto está agora na fase de validação
comercial; não deve avançar para CRM, multiusuário ou pagamentos antes de
evidência de uso real.

## Achados da auditoria e situação

| Achado original | Situação | Evidência atual |
| --- | --- | --- |
| Leads reais expostos sem login | Risco aceito pelo responsável | O painel e as rotas do app são públicos por decisão de produto. RLS segue bloqueando acesso direto ao banco e a varredura mantém limite por IP. |
| RLS desativado | Resolvido | Migration aplicada. `leads` tem RLS ativo e `anon`/`authenticated` não possuem leitura direta. |
| Varredura sem limite de abuso | Resolvido como contenção inicial | Validação de payload e rate limit por IP na rota de varredura. Reavaliar solução persistente apenas se houver multiusuário. |
| Mensagem dizia "aqui em Franca" para outra cidade | Resolvido | Cidade passou a ser dinâmica nas mensagens novas. |
| Negócios fechados apareciam como oportunidade | Resolvido | Resultados `CLOSED_PERMANENTLY` e `CLOSED_TEMPORARILY` são ignorados. |
| Varredura confundia follow-up | Resolvido | `ultimo_contato_em` separa contato de `atualizado_em`. |
| Funil e botão "feito" com semântica errada | Resolvido | Fila e alertas usam estados comerciais; ação passou a fechar/reabrir lead de forma explícita. |
| Sem testes automatizados | Resolvido no escopo atual | Testes de score, cidade e utilitários passaram; build de produção aprovado. |
| Headers de segurança ausentes | Resolvido | CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` configurados. |
| Documentação desatualizada | Resolvido no escopo de Sprint 0/1 | `.env.example`, README e guias de produção/validação foram atualizados. |

## Backlog que permanece válido

Estes itens continuam importantes, mas estão fora da Sprint 1 atual:

- Sanitização contra fórmula na exportação CSV.
- Paginação e filtros de cidade/nicho no servidor.
- Proteção de URLs antes de qualquer consulta de site usada por IA.
- Erro explícito em produção quando o Supabase estiver indisponível; nunca
  mascarar falha real com dados demo.
- Atualização controlada do Next.js e revisão do `npm audit`.
- CI com testes, typecheck, build e auditoria de dependências.
- Aplicação real do raio de busca ou remoção do campo da interface.
- Histórico comercial ampliado: próxima ação, motivo de perda, origem e linha
  do tempo mínima.

## Ordem obrigatória

1. **Sprint 1 — agora:** executar 1 a 2 semanas de operação manual, com até
   dois nichos em Franca/SP e métricas de contatos, respostas e reuniões.
2. **Decisão com dados:** após 50 contatos qualificados, identificar o
   gargalo real da operação.
3. **Sprint 2:** somente então, implementar o menor conjunto de melhorias de
   CRM necessário para remover esse gargalo.
4. **Sprints 3 a 5:** personalização segura, multiusuário/pagamentos e
   qualidade de plataforma apenas nas dependências definidas pelo plano.

## Regras permanentes

- Não enviar mensagens automaticamente; WhatsApp é sempre ação humana.
- Usar apenas APIs oficiais para dados públicos.
- Manter `SUPABASE_SERVICE_ROLE_KEY` exclusivamente no servidor.
- Não expor dados ou rotas de varredura a visitantes.
- Não transformar falha de produção em modo demo silencioso.
