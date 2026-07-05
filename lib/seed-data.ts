import type { Lead } from "./supabase";

// Leads reais coletados em Franca/SP. Usados no "modo demo" quando o
// Supabase ainda não foi configurado — a app roda e mostra dados de
// verdade sem exigir credenciais. Assim que o .env estiver preenchido,
// os dados passam a vir do banco.
export const SEED_LEADS: Lead[] = [
  {
    id: "seed-1",
    place_id: "seed-p1",
    lat: -20.533,
    lon: -47.395,
    nicho: "academia",
    nome: "Allp Fit Academia | Franca",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: null,
    site: "instagram.com/allpfit.franca",
    rating: 4.8,
    qtd_reviews: 12,
    score_oportunidade: 70,
    motivo_abordagem: "so_rede_social",
    mensagem_sugerida:
      "Oi! Vi que a Allp Fit tá em pré-inauguração aqui em Franca, muito " +
      "bacana! Sou o Vitor, do @engenheiro.ai — ajudo negócios locais a " +
      "estruturar a parte digital: site, automação de agendamento e " +
      "atendimento no WhatsApp. Como vocês ainda estão montando a " +
      "identidade digital, é o momento perfeito pra já nascer redondo. " +
      "Posso te mandar um exemplo rápido de como ficaria o site e o fluxo " +
      "de agendamento de vocês? Sem compromisso, só pra vocês verem a ideia.",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-2",
    place_id: "seed-p2",
    lat: -20.542,
    lon: -47.408,
    nicho: "salão de unhas",
    nome: "kêmili Domenes Nails Designer",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: "+55 16 99999-0732",
    site: null,
    rating: 4.9,
    qtd_reviews: 247,
    score_oportunidade: 55,
    motivo_abordagem: "sem_site",
    mensagem_sugerida:
      "Oi Kêmili, tudo bem? Vi seu trabalho aqui em Franca — as avaliações " +
      "são impressionantes, dá pra ver que suas clientes confiam muito no " +
      "seu trabalho! Só reparei que você ainda não tem um site próprio — " +
      "hoje isso significa perder gente que pesquisa 'manicure em Franca' " +
      "no Google e nem te encontra, mesmo você sendo tão bem avaliada. Sou " +
      "o Vitor, do @engenheiro.ai, ajudo profissionais como você a ter um " +
      "site simples com agendamento automático pelo WhatsApp. Posso te " +
      "mostrar como ficaria o seu, sem compromisso?",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-3",
    place_id: "seed-p3",
    lat: -20.535,
    lon: -47.412,
    nicho: "salão de unhas",
    nome: "Unhas By Karla",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: "+55 16 98801-5150",
    site: "instagram.com/unhasbykarla",
    rating: 4.7,
    qtd_reviews: 189,
    score_oportunidade: 55,
    motivo_abordagem: "so_rede_social",
    mensagem_sugerida:
      "Oi Karla, tudo bem? Vi o seu trabalho aqui em Franca — reparei um " +
      "comentário de uma cliente dizendo que é fiel há quase 30 anos, isso " +
      "é uma reputação que pouca gente consegue construir! Só que hoje, " +
      "quem pesquisa 'unha em Franca' no Google não necessariamente te " +
      "encontra fácil — só aparece o Instagram. Sou o Vitor, do " +
      "@engenheiro.ai, e ajudo profissionais como você a resolver isso: um " +
      "site simples que traduz essa confiança de anos pra quem tá " +
      "pesquisando agora. Posso te mandar uma ideia de como ficaria, sem " +
      "compromisso?",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-4",
    place_id: "seed-p4",
    lat: -20.545,
    lon: -47.398,
    nicho: "hamburgueria",
    nome: "Hamburgueria Alameda",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: "+55 16 3406-6201",
    site: null,
    rating: 4.6,
    qtd_reviews: 708,
    score_oportunidade: 45,
    motivo_abordagem: "sem_site",
    mensagem_sugerida:
      "Oi! Vi a Hamburgueria Alameda — mais de 700 avaliações com nota " +
      "ótima! Negócio que tá bombando. Só reparei que vocês não têm um " +
      "site próprio ainda — isso é perder cliente que tá pesquisando no " +
      "Google. Sou Vitor do @engenheiro.ai, ajudo hamburgueria a vender " +
      "mais com site + automação de pedido. Posso te mostrar como ficaria?",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-5",
    place_id: "seed-p5",
    lat: -20.528,
    lon: -47.402,
    nicho: "hamburgueria",
    nome: "Brutu's Lanches",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: "+55 16 3721-2620",
    site: null,
    rating: 4.5,
    qtd_reviews: 1630,
    score_oportunidade: 45,
    motivo_abordagem: "sem_site",
    mensagem_sugerida:
      "Oi! Vi o Brutu's Lanches — mais de 1.600 avaliações, tá consolidado " +
      "demais! Mas sem site próprio. Cliente pesquisa no Google, não acha " +
      "fácil. Isso aí é oportunidade. Sou Vitor do @engenheiro.ai. Ajudo " +
      "lanchonete a vender mais. Pode ser?",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-6",
    place_id: "seed-p6",
    lat: -20.539,
    lon: -47.418,
    nicho: "salão de unhas",
    nome: "Cintia Carla Nails",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: "+55 16 99435-8532",
    site: "instagram.com/cintiacarlanails",
    rating: 4.8,
    qtd_reviews: 156,
    score_oportunidade: 30,
    motivo_abordagem: "so_rede_social",
    mensagem_sugerida:
      "Oi Cintia! Vi seu trabalho aqui em Franca — ótimas avaliações! Só " +
      "que tá só no Instagram. Um site ajuda a capturar quem tá " +
      "pesquisando no Google. Sou Vitor do @engenheiro.ai. Quer ver como " +
      "ficaria?",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-7",
    place_id: "seed-p7",
    lat: -20.548,
    lon: -47.405,
    nicho: "barbearia",
    nome: "Barbearia Barber Club",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: "+55 16 99167-6818",
    site: "instagram.com/barberclubfranca",
    rating: 4.7,
    qtd_reviews: 423,
    score_oportunidade: 30,
    motivo_abordagem: "so_rede_social",
    mensagem_sugerida:
      "Oi! Vi o Barber Club aqui em Franca — ótimas avaliações! Só " +
      "Instagram ainda. Um site próprio + agendamento no WhatsApp aumenta " +
      "demanda. Sou Vitor do @engenheiro.ai. Quer conversar?",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-8",
    place_id: "seed-p8",
    lat: -20.531,
    lon: -47.415,
    nicho: "academia",
    nome: "Academia BlueFit Franca",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: "+55 11 93234-0182",
    site: "bluefit.com.br/unidade/franca",
    rating: 4.3,
    qtd_reviews: 89,
    score_oportunidade: 25,
    motivo_abordagem: "poucas_reviews",
    mensagem_sugerida:
      "Oi! Vi a BlueFit aqui em Franca — boa nota, mas poucas avaliações " +
      "ainda. Isso é oportunidade pra crescer. Sou Vitor do @engenheiro.ai, " +
      "ajudo academias a vender mais e aumentar avaliações. Posso ajudar?",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-9",
    place_id: "seed-p9",
    lat: -20.525,
    lon: -47.397,
    nicho: "academia",
    nome: "SIM, uma não academia",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: "+55 16 99241-1065",
    site: "simumanaoacademia.com.br",
    rating: 4.5,
    qtd_reviews: 67,
    score_oportunidade: 10,
    motivo_abordagem: "geral",
    mensagem_sugerida:
      "Oi! Vi a SIM aqui em Franca. Tá bem estruturada já. Ajudo com " +
      "automação de WhatsApp e conversão. Topa conversar?",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: "seed-10",
    place_id: "seed-p10",
    lat: -20.544,
    lon: -47.42,
    nicho: "hamburgueria",
    nome: "Hugg's Burger Brasil",
    endereco: "Franca, SP",
    cidade: "Franca, SP",
    telefone: null,
    site: "delivery.huggsburgerbrasil.com.br",
    rating: 4.8,
    qtd_reviews: 2540,
    score_oportunidade: 0,
    motivo_abordagem: "geral",
    mensagem_sugerida:
      "Oi! Hugg's é cliente em potencial. Tá bem estabelecido já, mas " +
      "sempre dá pra melhorar conversão. Posso mostrar.",
    status: "não contatado",
    notas: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
];
