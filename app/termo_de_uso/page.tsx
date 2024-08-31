'use client';

import React from 'react';

export default function PoliticaDeUso() {
  return (
    <div className="politicadeuso-container">
      <h1 className="politicadeuso-h1">Termo de Uso da Mais NFe</h1>

      <p className="politicadeuso-p">Bem-vindo à Mais NFe! Agradecemos por escolher nossos serviços. Este Termo de Uso foi elaborada para garantir que todos os usuários compreendam as responsabilidades associadas ao uso de nossa plataforma. É fundamental que você leia atentamente os termos abaixo antes de utilizar nossos serviços.</p>

      <h2 className="politicadeuso-h2">1. Responsabilidade do Usuário</h2>
      <p className="politicadeuso-p">Como usuário da Mais NFe, você é integralmente responsável pela configuração das regras tributárias dentro da plataforma. Esta configuração deve ser feita de maneira precisa e em conformidade com a legislação vigente. É altamente recomendado que todas as configurações sejam realizadas em conjunto com um contador ou consultor fiscal de sua confiança, para garantir que todas as regras tributárias estejam corretas.</p>
      <p className="politicadeuso-p">Qualquer erro nas configurações fiscais, seja por inserção de dados incorretos ou por interpretação inadequada das leis tributárias, será de responsabilidade exclusiva do usuário. A Mais NFe não se responsabiliza por multas, penalidades ou outros problemas decorrentes de configurações inadequadas.</p>

      <h2 className="politicadeuso-h2">2. Origem dos Dados de Cadastro de Empresas</h2>
      <p className="politicadeuso-p">Nossa API oferece acesso contínuo a informações atualizadas, garantindo dados precisos que não excedem 45 dias de defasagem, provenientes dos seguintes portais públicos:</p>
      <ul className="politicadeuso-ul">
        <li>Receita Federal: Dados cadastrais, situação, contatos, endereço, CNAEs e sócios.</li>
        <li>Simples Nacional: Indicador de opção e datas de inclusão no Simples e MEI.</li>
        <li>Cadastro de Contribuintes: Número, UF e situação cadastral das inscrições estaduais.</li>
        <li>SUFRAMA: Número, situação cadastral, e incentivos fiscais da inscrição.</li>
      </ul>
      <p className="politicadeuso-p">A Mais NFe não se responsabiliza pela veracidade ou atualização dessas informações. É obrigação do usuário revisar e confirmar que os dados fornecidos estão corretos antes de utilizá-los para fins fiscais ou comerciais.</p>

      <h2 className="politicadeuso-h2">3. Uso do Ambiente de Homologação</h2>
      <p className="politicadeuso-p">Antes de emitir Notas Fiscais Eletrônicas (NF-e) no ambiente de produção, é obrigatório o uso do ambiente de homologação para testar e validar todas as configurações. O ambiente de homologação oferece a oportunidade de simular a emissão de notas fiscais sem os impactos legais, permitindo que você verifique se todos os cálculos e configurações estão corretos.</p>
      <p className="politicadeuso-p">A emissão de NF-e sem a devida validação no ambiente de homologação pode resultar em erros que impactam sua operação financeira e fiscal. A Mais NFe não se responsabiliza por problemas que possam ocorrer devido à falta de testes no ambiente de homologação.</p>

      <h2 className="politicadeuso-h2">4. Limitação de Responsabilidade</h2>
      <p className="politicadeuso-p">A Mais NFe oferece ferramentas e funcionalidades para facilitar a emissão de NF-e e a gestão tributária. No entanto, a responsabilidade pela verificação e configuração correta das informações é inteiramente do usuário. A Mais NFe não se responsabiliza por configurações incorretas que possam resultar em emissão errada de notas fiscais, pagamento de tributos indevidos ou problemas legais.</p>
      <p className="politicadeuso-p">Além disso, a Mais NFe não se responsabiliza por eventuais danos ou prejuízos causados por falhas no sistema que estejam fora do nosso controle, como interrupções no serviço de internet, problemas nos servidores da Receita Federal ou outros fatores externos.</p>

      <h2 className="politicadeuso-h2">5. Atualizações no Termo de Uso</h2>
      <p className="politicadeuso-p">Este Termo de Uso pode ser atualizada periodicamente para refletir mudanças em nossos serviços ou em conformidade com novas legislações. As alterações serão publicadas em nosso site, e é de responsabilidade do usuário revisar regularmente esta política para se manter informado sobre quaisquer mudanças.</p>

      <h2 className="politicadeuso-h2">6. Suporte e Contato</h2>
      <p className="politicadeuso-p">Se você tiver qualquer dúvida sobre este Termo de Uso ou precisar de assistência com nossas ferramentas, nossa equipe de suporte está à disposição para ajudar. Entre em contato conosco pelo e-mail suporte@maisnfe.com.br.</p>

      <p className="politicadeuso-p">Agradecemos por utilizar a Mais NFe. Estamos comprometidos em fornecer a melhor solução para suas necessidades fiscais e empresariais.</p>
    </div>
  );
}

