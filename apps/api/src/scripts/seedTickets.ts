import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@dgcom/db';

const { tickets, ticketCategories, products } = schema;

const SUBJECTS = [
  'Não consigo acessar o painel da minha conta',
  'Erro ao tentar efetuar pagamento',
  'Produto não aparece na minha biblioteca',
  'Quero solicitar troca de titularidade',
  'Não recebi o boleto do mês',
  'Problema com certificado de conclusão',
  'Dúvida sobre cancelamento de assinatura',
  'E-mail de recuperação de senha não chegou',
  'Cobrança duplicada no cartão de crédito',
  'Como emitir nota fiscal da compra?',
  'Vídeo da aula não carrega no celular',
  'Preciso unificar duas contas',
  'Dados cadastrais incorretos no sistema',
  'Problema ao assistir aula ao vivo',
  'Quero solicitar reembolso',
  'Erro 500 ao tentar salvar progresso do curso',
  'Não recebi confirmação de matrícula',
  'Como alterar e-mail de acesso?',
  'Acesso bloqueado após tentativas de login',
  'Cupom de desconto não foi aplicado',
  'Produto listado mas sem conteúdo disponível',
  'Parcela recusada pelo banco',
  'Como funciona a garantia de 30 dias?',
  'Erro ao baixar material complementar',
  'App mobile não sincroniza progresso',
  'Nome errado no certificado emitido',
  'Não consigo assistir aulas offline',
  'Dúvida sobre plano anual vs mensal',
  'Suporte para acessibilidade na plataforma',
  'Integração com plataforma de terceiros com falha',
];

const DESCRIPTIONS = [
  'Estou tentando acessar há dois dias e recebo a mensagem de erro "Usuário não encontrado". Já tentei redefinir a senha, mas o problema persiste.',
  'Ao tentar finalizar a compra, o sistema exibe a mensagem "Falha ao processar pagamento" mesmo com o cartão válido e saldo disponível.',
  'Comprei o curso ontem mas ele não aparece na minha biblioteca de produtos. O pagamento foi confirmado no cartão.',
  'Preciso transferir minha conta para outro CPF pois me casei e mudei o documento.',
  'Já se passaram 5 dias úteis e não recebi o boleto de cobrança. Preciso regularizar a situação.',
  'Concluí o curso há mais de uma semana mas o certificado ainda não foi gerado na plataforma.',
  'Gostaria de entender como funciona o processo de cancelamento e se terei acesso até o fim do período pago.',
  'Solicitei a redefinição de senha mas o e-mail de confirmação não chegou. Verifiquei o spam.',
  'Fui cobrado duas vezes pelo mesmo produto no mesmo mês. Preciso do estorno de uma das cobranças.',
  'Preciso emitir a nota fiscal da minha compra para fins de declaração de imposto de renda.',
  'No computador as aulas funcionam normalmente, mas no celular o vídeo fica carregando e nunca abre.',
  'Tenho duas contas com e-mails diferentes e gostaria de unificá-las mantendo todo o histórico de compras.',
  'Meu nome está grafado incorretamente na plataforma. Preciso corrigir para CPF: correto é "João da Silva".',
  'A transmissão ao vivo do evento de hoje estava com travamentos constantes e ficou inacessível por 2 horas.',
  'Não estou satisfeito com o produto e estou dentro do prazo de 30 dias. Gostaria de solicitar o reembolso.',
  'Sempre que clico em "Salvar" na lição, aparece Erro 500 e o progresso não é registrado.',
  'Realizei a matrícula há 3 horas e ainda não recebi o e-mail de boas-vindas com os dados de acesso.',
  'Quero alterar o e-mail da minha conta pois o antigo não existe mais.',
  'Após 5 tentativas de login incorretas minha conta ficou bloqueada. Preciso de ajuda para desbloquear.',
  'O cupom que recebi por e-mail não foi aceito no checkout. Já conferi e está dentro da validade.',
  'O produto aparece como disponível na loja mas ao acessar fica vazio, sem nenhuma aula ou material.',
  'Minha parcela foi recusada pelo banco mas tenho saldo. Gostaria de tentar novamente ou trocar a forma de pagamento.',
  'Li nos termos que há garantia de 30 dias, mas não encontro a opção de solicitar reembolso na minha conta.',
  'Ao tentar baixar o PDF da aula o sistema retorna erro de "arquivo não encontrado".',
  'O progresso que faço no app não aparece quando acesso pelo computador. As aulas aparecem como não assistidas.',
  'Concluí o módulo e o certificado foi emitido, mas meu nome está com acento errado: "Lucía" ao invés de "Lucia".',
  'Ativei o modo offline no app mas as aulas não ficam disponíveis sem internet como deveria.',
  'Gostaria de entender melhor as diferenças entre o plano anual e o mensal antes de renovar.',
  'Tenho deficiência visual e estou com dificuldades para navegar pela plataforma com leitor de tela.',
  'A integração com minha plataforma de afiliados parou de funcionar após a última atualização do sistema.',
];

const STATUSES = [
  'open',
  'open',
  'open',
  'in_progress',
  'in_progress',
  'waiting_customer',
  'resolved',
] as const;
const PRIORITIES = ['low', 'medium', 'medium', 'medium', 'high'] as const;
const CLIENT_TYPES = ['produtor', 'afiliado', 'comprador', 'agencia', null, null] as const;
const DOCUMENT_TYPES = ['cpf', 'cnpj', null, null, null] as const;

const REQUESTERS = [
  { name: 'Ana Lima', email: 'ana.lima@email.com' },
  { name: 'Carlos Mendes', email: 'carlos.mendes@email.com' },
  { name: 'Fernanda Costa', email: 'fernanda.costa@email.com' },
  { name: 'João Alves', email: 'joao.alves@email.com' },
  { name: 'Mariana Souza', email: 'mariana.souza@email.com' },
  { name: 'Roberto Nunes', email: 'roberto.nunes@email.com' },
  { name: 'Patricia Oliveira', email: 'patricia.oliveira@email.com' },
  { name: 'Thiago Barbosa', email: 'thiago.barbosa@email.com' },
  { name: 'Camila Ferreira', email: 'camila.ferreira@email.com' },
  { name: 'Diego Santos', email: 'diego.santos@email.com' },
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

const db = getDb();

// Busca categorias e produtos existentes
const categories = await db.select().from(ticketCategories);
const prods = await db.select().from(products);

console.log(`[seed] categorias disponíveis: ${categories.length}`);
console.log(`[seed] produtos disponíveis: ${prods.length}`);

const now = new Date();

for (let i = 0; i < 30; i++) {
  const requester = pick(REQUESTERS, i);
  const status = pick(STATUSES, i);
  const priority = pick(PRIORITIES, i);
  const clientType = pick(CLIENT_TYPES, i) as
    | 'produtor'
    | 'afiliado'
    | 'comprador'
    | 'agencia'
    | null;
  const documentType = pick(DOCUMENT_TYPES, i) as 'cpf' | 'cnpj' | null;
  const categoryId = categories.length > 0 ? pick(categories, i).id : null;
  const productId = prods.length > 0 && i % 3 !== 0 ? pick(prods, i).id : null;

  // Insere com code placeholder
  const [inserted] = await db
    .insert(tickets)
    .values({
      code: 'pending',
      subject: SUBJECTS[i],
      description: DESCRIPTIONS[i],
      status,
      priority,
      requesterName: requester.name,
      requesterEmail: requester.email,
      clientType,
      documentType,
      categoryId,
      productId,
      updatedAt: new Date(now.getTime() - i * 3_600_000), // distribui no tempo
    })
    .returning();

  if (!inserted) {
    console.error(`[seed] falha ao inserir ticket ${i + 1}`);
    continue;
  }

  // Gera code real "DG-XXXX" a partir da sequence
  const code = `DG-${String(inserted.sequence).padStart(4, '0')}`;
  await db.update(tickets).set({ code }).where(eq(tickets.id, inserted.id));

  console.log(`[seed] ${i + 1}/30 — ${code} "${SUBJECTS[i].slice(0, 50)}..."`);
}

console.log('[seed] 30 tickets criados com sucesso!');
process.exit(0);
