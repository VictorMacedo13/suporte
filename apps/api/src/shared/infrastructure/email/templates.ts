function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;background:#f4f6fa;font-family:Geist,system-ui,sans-serif;color:#0A2540">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(10,37,64,.06)">
        <tr><td>
          <div style="font-size:14px;color:#1758E6;font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin-bottom:8px">Suporte DGcom</div>
          <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:600">${title}</h1>
          ${body}
          <hr style="border:none;border-top:1px solid #e6ebf1;margin:24px 0"/>
          <p style="font-size:12px;color:#425466;margin:0">Voce recebeu este email porque ha atividade em uma conta de suporte da DGcom.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function magicLinkTemplate(url: string) {
  const body = `
    <p style="margin:0 0 16px 0">Clique no botao abaixo para entrar na sua conta:</p>
    <p style="margin:0 0 16px 0">
      <a href="${url}" style="display:inline-block;background:#1758E6;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:500">Entrar</a>
    </p>
    <p style="margin:0;color:#425466;font-size:13px">Se voce nao solicitou esse acesso, ignore este email.</p>`;
  return {
    subject: 'Seu link de acesso ao Suporte DGcom',
    html: shell('Acesso por link', body),
  };
}

export function ticketCreatedTemplate(args: {
  code: string;
  subject: string;
  description: string;
  requesterName: string;
  productName?: string | null;
  url?: string;
}) {
  const productRow = args.productName
    ? `<tr><td style="padding:4px 0;color:#425466">Produto</td><td style="padding:4px 0 4px 16px;font-weight:500">${args.productName}</td></tr>`
    : '';

  const linkBtn = args.url
    ? `<p style="margin:24px 0 0 0"><a href="${args.url}" style="display:inline-block;background:#1758E6;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:500">Acompanhar chamado</a></p>`
    : '';

  const body = `
    <p style="margin:0 0 16px 0">Ola, <strong>${args.requesterName}</strong>. Recebemos seu chamado e ja registramos com o codigo <strong>${args.code}</strong>.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:16px">
      <tr><td style="padding:4px 0;color:#425466">Assunto</td><td style="padding:4px 0 4px 16px;font-weight:500">${args.subject}</td></tr>
      ${productRow}
    </table>
    <div style="background:#f4f6fa;border-radius:8px;padding:16px;margin-bottom:16px">
      <div style="font-size:12px;color:#425466;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Descricao</div>
      <p style="margin:0;white-space:pre-wrap;font-size:14px">${args.description}</p>
    </div>
    ${linkBtn}
    <p style="margin:16px 0 0 0;color:#425466;font-size:13px">Em breve um atendente respondera por aqui.</p>`;
  return {
    subject: `Chamado ${args.code} recebido — ${args.subject}`,
    html: shell('Chamado recebido', body),
  };
}

export function inviteUserTemplate(args: { name: string; url: string }) {
  const body = `
    <p style="margin:0 0 16px 0">Ola, <strong>${args.name}</strong>!</p>
    <p style="margin:0 0 16px 0">Voce foi convidado para acessar o portal de suporte da DGcom. Clique no botao abaixo para criar sua senha e finalizar o cadastro:</p>
    <p style="margin:0 0 16px 0">
      <a href="${args.url}" style="display:inline-block;background:#1758E6;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:500">Criar minha senha</a>
    </p>
    <p style="margin:0;color:#425466;font-size:13px">Este link expira em 1 hora. Se voce nao esperava este convite, ignore este email.</p>`;
  return {
    subject: 'Convite para o Suporte DGcom — crie sua senha',
    html: shell('Bem-vindo ao Suporte DGcom', body),
  };
}

export function ticketReplyTemplate(args: {
  code: string;
  subject: string;
  authorName: string;
  content: string;
  url?: string;
}) {
  const linkLine = args.url ? `` : '';
  const body = `
    <p style="margin:0 0 16px 0">Houve uma nova resposta no chamado <strong>${args.code}</strong> (${args.subject}).</p>
    <blockquote style="margin:0;padding:12px 16px;background:#f4f6fa;border-left:3px solid #1758E6;border-radius:4px;white-space:pre-wrap">
      <strong style="display:block;margin-bottom:4px">${args.authorName}</strong>
      <span style="color:#425466">${args.content}</span>
    </blockquote>
    ${linkLine}`;
  return {
    subject: `Nova resposta no chamado ${args.code}`,
    html: shell('Nova resposta', body),
  };
}
