-- Padroniza todos os leads pendentes que ainda não foram contatados.
-- Preserva o texto que foi efetivamente usado em conversas, respostas e vendas.
update public.leads l
set mensagem_sugerida = concat(
  'Oi, tudo bem? Encontrei ', coalesce(nullif(trim(l.nome), ''), 'seu negócio'),
  ' pesquisando ', coalesce(nullif(trim(l.nicho), ''), 'negócios locais'),
  ' em ', coalesce(nullif(trim(l.cidade), ''), 'sua cidade'),
  ' e vi ',
  case
    when l.rating is not null and l.qtd_reviews is not null
      then concat('a reputação de vocês no Google: nota ', l.rating, ' em ', l.qtd_reviews, ' avaliações.')
    else 'o perfil de vocês no Google.'
  end,
  ' Sou o Vitor, do engenheiro.ai, e ajudo negócios locais a organizar presença digital e atendimento no WhatsApp. ',
  case l.motivo_abordagem
    when 'sem_site' then 'Percebi que o perfil do Google ainda não tem um site próprio vinculado, o que pode dificultar que uma busca vire atendimento.'
    when 'so_rede_social' then 'Reparei que o principal link do perfil leva ao Instagram, e há espaço para transformar essas buscas em conversas e agendamentos.'
    when 'poucas_reviews' then 'A nota é muito boa; há espaço para aproveitar melhor cada cliente satisfeito e fortalecer essa reputação no Google.'
    else 'Queria entender como está hoje a presença digital e o atendimento de vocês.'
  end,
  ' Hoje os novos contatos de vocês chegam mais pelo WhatsApp ou pelo Instagram?'
)
where l.status = 'não contatado';
