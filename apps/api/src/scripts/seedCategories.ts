import 'dotenv/config';
import { getDb, schema } from '@dgcom/db';

const CATEGORIES = [
  { slug: 'dados-cadastrais', name: 'Dados Cadastrais' },
  { slug: 'troca-titularidade', name: 'Troca de Titularidade' },
  { slug: 'cancelamento-conta', name: 'Cancelamento de Conta' },
  { slug: 'unificacao-contas', name: 'Unificação de Contas' },
  { slug: 'sem-acesso-curso', name: 'Sem Acesso ao Curso' },
  { slug: 'pagamentos-faturas', name: 'Pagamentos e Faturas' },
  { slug: 'problemas-tecnicos', name: 'Problemas Técnicos' },
  { slug: 'outros-assuntos', name: 'Outros Assuntos' },
];

const db = getDb();

for (const cat of CATEGORIES) {
  await db
    .insert(schema.ticketCategories)
    .values({ name: cat.name, slug: cat.slug })
    .onConflictDoNothing({ target: schema.ticketCategories.slug });
  console.log(`[seed] ${cat.slug}`);
}

console.log('[seed] categorias inseridas com sucesso.');
process.exit(0);
