import { GameEvent, GameState, RegionID, FactionID } from '../types/game';

// Eventos Históricos do Prequel Mandatório (2024 - 2033)
export const PREQUEL_EVENTS: Record<number, GameEvent> = {
  2024: {
    id: 'PREQ_2024',
    title: 'Construção do Mega Data Center da Huawei em Ciudad del Este',
    description: 'A gigante tecnológica chinesa Huawei, associada à State Grid de Pequim, inicia a instalação de um Data Center Sólido de Inteligência Artificial adjacente a Itaipu. Sob o pretexto de prestar apoio logístico de meteorologia e otimização agrícola, eles requerem o desvio definitivo do fluxo elétrico de duas turbinas completas da usina de Itaipu para alimentar os racks de resfriamento líquido do diretor Li Wei.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    choices: [
      {
        id: '2024_A',
        text: 'Apoiar o projeto em troca de subvenções tecnológicas de Shenzhen',
        consequencesDescription: 'Garante fundos e dados imediatos para as agências federais brasileiras em Brasília, mas abre precedente de cessão de soberania elétrica.',
        effect: {
          fundsChange: 80,
          intelPointsChange: 40,
          popularSupportChange: -5,
          politicalStabilityChange: -10,
          globalInfluenceChange: 15,
          logMessage: 'O Data Center da Huawei em Ciudad del Este foi autorizado com consentimento pragmático brasileiro. O diretor Li Wei celebrou o acordo de escoamento e transferiu bônus de silício e servidores para os centros analíticos nacionais.'
        }
      },
      {
        id: '2024_B',
        text: 'Barrar o desvio de Megawatts evocando cláusulas de segurança energética',
        consequencesDescription: 'Preserva a integridade da transmissão para o Sudeste de São Paulo, mas enfurece a diplomacia cibernética de Pequim e da Junta de Assunção.',
        effect: {
          fundsChange: -20,
          intelPointsChange: -10,
          popularSupportChange: 15,
          politicalStabilityChange: 20,
          globalInfluenceChange: -15,
          relationChange: { PARAGUAI: -25 },
          logMessage: 'O Brasil bloqueou a cessão de turbinas para o complexo de Shenzhen. O General Caballero acusou o governo de Mendonça de "fome diplomática e assédio logístico", enquanto a Huawei congelou investimentos paralelos.'
        }
      }
    ]
  },
  2025: {
    id: 'PREQ_2025',
    title: 'Modernização de Redes e a Instalação Oculta de Backdoors',
    description: 'A State Grid assume a concessão de subestações de alta tensão na Região Sul. Durante a substituição física dos relés eletromecânicos por painéis automatizados inteligentes, a tenente-coronel paraguaia Lúcia Espínola coordena com equipes de campo a infiltração de uma linha paralela de microfirmwares criptografados. Esses módulos dão controle total e remoto de trip do sistema elétrico do Sudeste, apelidados secretamente de "Cavalos de Tróia do Iguaçu".',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    choices: [
      {
        id: '2025_A',
        text: 'Aceitar a digitalização imediata de baixo custo sem auditorias profundas',
        consequencesDescription: 'Economiza vultosos capitais políticos e maximiza a eficiência elétrica imediata nas indústrias de Curitiba e São Paulo.',
        effect: {
          fundsChange: 60,
          fuelReserveChange: 40,
          popularSupportChange: 10,
          intelPointsChange: -30,
          politicalStabilityChange: 10,
          logMessage: 'A modernização de rede foi concluída rapidamente sem resistência burocrática. Nas sombras da usina, a equipe cibernética paraguaia registrou a consolidação dos backdoors em centenas de IPs essenciais.'
        }
      },
      {
        id: '2025_B',
        text: 'Autorizar uma comissão especial de auditoria forense criptográfica da Abin',
        consequencesDescription: 'Custa fundos orçamentários de contingência científica, mas limita a proliferação de backdoors ocultos de Ciudad del Este.',
        effect: {
          fundsChange: -40,
          intelPointsChange: 50,
          popularSupportChange: -5,
          politicalStabilityChange: 20,
          logMessage: 'Agentes cibernéticos da Abin descobriram dezenas de chips não-declarados nos roteadores industriais de fiação de alta tensão. As infiltrações foram isoladas, enfurecendo Li Wei sob alegações de "difamação xenófoba".'
        }
      }
    ]
  },
  2026: {
    id: 'PREQ_2026',
    title: 'Infiltração Sistêmica da Operação CIA de Mike Connors',
    description: 'O experiente oficial da CIA Mike Connors chega focado em monitorar a rede de automação que a China ergueu na bacia do Paraná. Usando consultorias financeiras fachada para contatar Letícia Albuquerque e comitês de oposição em Brasília, Connors propõe conceder subsídios sigilosos de fundos estrangeiros e consultoria em troca de minar o controle do exército legalista sobre a defesa de Itaipu.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    choices: [
      {
        id: '2026_A',
        text: 'Consentir com as redes paralelas de cooperação secreta propostas pela CIA',
        consequencesDescription: 'Abre conexões estratégicas de inteligência oculta nos computadores de Langley (+50 de Inteligência), reduzindo os custos de soberania das forças armadas brasileiras.',
        effect: {
          intelPointsChange: 60,
          globalInfluenceChange: 25,
          popularSupportChange: -10,
          politicalStabilityChange: -15,
          logMessage: 'O consentimento tácito brasileiro permitiu que dezenas de antenas de alta sensibilidade e equipamentos de escuta americanos fossem camuflados na região fronteiriça do Paraná.'
        }
      },
      {
        id: '2026_B',
        text: 'Repelir a ingerência e decretar vigilância militar sobre os consultores estrangeiros',
        consequencesDescription: 'Reforça o patriotismo soberano do exército brasileiro, mas frustra Mike Connors e desgasta o apoio financeiro nas agências estrangeiras.',
        effect: {
          intelPointsChange: -20,
          globalInfluenceChange: -20,
          popularSupportChange: 20,
          politicalStabilityChange: 15,
          logMessage: 'O escritório de fachada de Connors foi cercado pela Abin e expulso do país pelo clamor de Mendonça. O Departamento de Estado americano cortou acordos bilaterais de inteligência.'
        }
      }
    ]
  },
  2027: {
    id: 'PREQ_2027',
    title: 'Sequestro Criptográfico nos Portos do Sul (Santos e Paranaguá)',
    description: 'Um poderoso vírus ransomware paralisa por completo as catracas eletrônicas e os robôs de movimentação de contêineres e combustíveis do Porto de Santos e Paranaguá. Todo o escoamento agrícola e transporte de óleo lubrificante de MS é bloqueado instantaneamente, criando um imenso congestionamento de navios. A autoria aponta para agentes cibernéticos do Leste que atuam sob coordenadas de hackers paraguaias.',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    choices: [
      {
        id: '2027_A',
        text: 'Pagar o resgate digital de 35 Milhões de dólares em criptoativos',
        consequencesDescription: 'Restabelece as rotas de exportação e fluxos de transporte no dia seguinte, mas consome preciosos fundos de contingência militar.',
        effect: {
          fundsChange: -50,
          fuelReserveChange: 30,
          popularSupportChange: 10,
          politicalStabilityChange: 15,
          logMessage: 'O resgate foi silenciosamente pago da conta reservada do Banco Central em Brasília. Os servidores do Porto foram liberados por uma contra-chave enviada de um IP reverso no Chaco.'
        }
      },
      {
        id: '2027_B',
        text: 'Recusar o pagamento e forçar decodificação em cooperação com as Forças Especiais',
        consequencesDescription: 'Estimula respostas digitais severas e soberanas do General Gama, mas paralisa o porto por semanas, sufocando as reservas de diesel e combustíveis do país.',
        effect: {
          fundsChange: -10,
          fuelReserveChange: -60,
          intelPointsChange: 40,
          popularSupportChange: -15,
          politicalStabilityChange: -20,
          logMessage: 'A recusa brasileira provocou longas duas semanas de paralisia física nos trilhos de escoamento. O diesel militar teve de ser racionado para o reabastecimento das cidades-polo do interior.'
        }
      }
    ]
  },
  2028: {
    id: 'PREQ_2028',
    title: 'O Reset de Firmware Remoto dos Blindados Bradley no Chaco',
    description: 'Durante exercícios táticos conjuntos entre a Coalizão do Chaco e assessores do Paraguai, doze blindados M2 Bradley de fabricação norte-americana sofrem uma pane elétrica catastrófica. Seus motores de ignição e radares de mira entram em travamento sistêmico. O General Eladio Franco aponta que um reset tático remoto de firmware foi enviado via satélite de Langley por Mike Connors para desmobilizar o poderio móvel local.',
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    choices: [
      {
        id: '2028_A',
        text: 'Ignorar o incidente e manter neutralidade estrita no Chaco',
        consequencesDescription: 'Evita colisão diplomática com os EUA, mas deixa as colunas blindadas paraguaias e do Chaco vulneráveis e ressentidas com o desequilíbrio armado.',
        effect: {
          globalInfluenceChange: 10,
          popularSupportChange: -5,
          relationChange: { COALIZAO_CHACO: -15 },
          logMessage: 'A diplomacia de Brasília tratou a desativação dos Bradley como "falha operacional local isolada". O General Alexei Benítez cortou a exportação prioritária de gás natural do Chaco para MS.'
        }
      },
      {
        id: '2028_B',
        text: 'Oferecer engenheiros eletrônicos em MS para reprogramar as placas dos Bradley',
        consequencesDescription: 'Gera aliança estreita com a Coalizão do Chaco e reverte a mordaça americana nos blindados, mas enfurece Langley.',
        effect: {
          fundsChange: -30,
          fuelReserveChange: 40, // O Chaco restabelece o fluxo de gás e combustível leve
          intelPointsChange: 30,
          globalInfluenceChange: -15,
          relationChange: { COALIZAO_CHACO: 30, PARAGUAI: 15 },
          logMessage: 'Oficiais técnicos em engenharia militar de MS cruzaram a fronteira desarmados e reprogramaram os microcontroladores das metralhadoras blindadas da Coalizão. O General Alexei de imediato retomou o abastecimento industrial de gás.'
        }
      }
    ]
  },
  2029: {
    id: 'PREQ_2029',
    title: 'Disparos de Drones paraguaios Wing Loong sobre a Lagoa Seca',
    description: 'A Junta Patriótica do general Santiago Caballero adquire secretamente trinta drones de ataque Wing Loong chineses. Durante testes furtivos ao norte do reservatório do Paraná, um drone invade o espaço aéreo do Mato Grosso do Sul de madrugada e dispara mísseis inertes contra uma guarita de controle avançada para mapear os tempos de reação antiaérea brasileiros.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=400',
    category: 'MILITAR',
    choices: [
      {
        id: '2029_A',
        text: 'Minimizar a agressão militar para manter os acordos econômicos ativos',
        consequencesDescription: 'Não desperdiça munição pesada, mas humilha as forças terrestres do sargento Lucas Azevedo, minando a lealdade interna no Alto Comando.',
        effect: {
          popularSupportChange: -15,
          politicalStabilityChange: -10,
          intelPointsChange: -10,
          logMessage: 'O silêncio do presidente Alberto Mendonça revoltou os postos de artilharia da fronteira. Oficiais de destaque acusaram Brasília de submissão covarde face ao avanço tecnológico do Paraguai.'
        }
      },
      {
        id: '2029_B',
        text: 'Decretar o abate ativo de vetores e reforçar guarnições de fronteira',
        consequencesDescription: 'Consome importantes estoques de suprimento militar do Sul, mas ergue de forma drástica a moral patriótica do exército brasileiro.',
        effect: {
          fuelReserveChange: -20,
          intelPointsChange: 20,
          popularSupportChange: 25,
          politicalStabilityChange: 15,
          relationChange: { PARAGUAI: -20 },
          logMessage: 'Baterias brasileiras dispararam fuzis e mísseis térmicos, derrubando o Wing Loong espião em chamas na margem paraguaia. Caballero usou as carcaças em Assunção para pregar o início da fúria patriótica.'
        }
      }
    ]
  },
  2030: {
    id: 'PREQ_2030',
    title: 'Sanções Cibernéticas e o Boicote de Chips da Nvidia/AMD',
    description: 'Em retaliação às ações soberanas brasileiras, o Departamento do Tesouro dos EUA impõe restrições extremas de exportação de chips gráficos aceleradores de inteligência artificial da Nvidia, AMD e ASML para empresas de infraestrutura estatais do Brasil. Sob o pretexto de "prevenção de militarização eletrônica", as Forças Armadas brasileiras recebem o ultimato da mordaça de processadores virtuais.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
    category: 'DIPLOMATICO',
    choices: [
      {
        id: '2030_A',
        text: 'Buscar aliança tecnológica alternativa com Pequim pelos semicondutores Loongson',
        consequencesDescription: 'Permite que as defesas eletrônicas do General Gama permaneçam ativas, mas amarra no longo prazo as chaves computacionais ao Data Center de Li Wei.',
        effect: {
          fundsChange: -30,
          intelPointsChange: 45,
          globalInfluenceChange: -10,
          popularSupportChange: -5,
          politicalStabilityChange: 10,
          logMessage: 'Pequim forneceu navios lotados de processadores Loongson em troca de cotas exclusivas de mineração no Chaco e concessões na hidrovia do Prata.'
        }
      },
      {
        id: '2030_B',
        text: 'Submeter-se ao desarmamento digital em troca de alívio tarifário de Washington',
        consequencesDescription: 'Alivia os orçamentos financeiros e agrada letícia Albuquerque, mas entrega de bandeja a inteligência das redes à subversão silenciosa cibernética externa.',
        effect: {
          fundsChange: 50,
          intelPointsChange: -40,
          globalInfluenceChange: 20,
          popularSupportChange: -15,
          politicalStabilityChange: -20,
          logMessage: 'Os aceleradores de defesa nacional foram desativados. Políticos e industriais em Brasília comemoraram o alívio imediato no comércio de soja com os EUA, expondo as redes elétricas brasileiras.'
        }
      }
    ]
  },
  2031: {
    id: 'PREQ_2031',
    title: 'A Greve Continental de Caminhoneiros do Cone Sul',
    description: 'Sindicatos de transporte terrestre e frotas interconectadas de frete continental entram em greve fulminante. Caminhoneiros como Seu Manoel bloqueiam as vias vitais de Cascavel, Guarapuava e Londrina. Eles reagem indignados aos apagões repentinos de sinal de GPS e pedágios automatizados de satélite, exigindo subsídios imediatos de combustível diesel e diesel tático sob a iminência de um colapso completo das provisões civis e estatais.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    choices: [
      {
        id: '2031_A',
        text: 'Atender as emendas laborais e injetar subsídios de óleo e combustíveis',
        consequencesDescription: 'Desfaz o bloqueio das estradas no dia seguinte, estabilizando as bases logísticas do Mato Grosso do Sul, ao custo de dotações orçamentárias pesadas.',
        effect: {
          fundsChange: -60,
          fuelReserveChange: 50,
          popularSupportChange: 35,
          politicalStabilityChange: 25,
          logMessage: 'Os subsídios acalmaram a categoria. Seu Manoel reativou sua frota no MS e, através de rádios amadores paralelos, passou a rastrear infiltrações cibernéticas de caminhões-radar paraguaios.'
        }
      },
      {
        id: '2031_B',
        text: 'Enviar a Polícia Rodoviária Federal e a Força Nacional para desbloquear por decreto',
        consequencesDescription: 'Demonstra autoridade estatal rígida e economiza fundos orçamentários, mas espalha violência pelas rodovias federais e incita revoltas civis.',
        effect: {
          fuelReserveChange: -40,
          popularSupportChange: -30,
          politicalStabilityChange: -20,
          logMessage: 'Colisões armadas se espalharam nas margens do Paraná. Duas refinarias de óleo diesel em MS foram sabotadas pelos caminhoneiros enfurecidos, gerando severo corte de combustível móvel.'
        }
      }
    ]
  },
  2032: {
    id: 'PREQ_2032',
    title: 'Coup Attempt: A Primeira Tentativa de Golpe Cibernético-Militar',
    description: 'Setores de direita militar descontentes com a debilidade industrial do presidente Mendonça, instigados secretamente pelas redes de desinformação da CIA dirigidas por Mike Connors, cercam o palácio do Planalto em Brasília com blindados leves. Eles exigem a renúncia imediata do presidente Alberto Mendonça e a assunção de uma junta provisória liderada por Letícia Albuquerque.',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    choices: [
      {
        id: '2032_A',
        text: 'Ceder e reestruturar o ministério de defesa incluindo a bancada da Frente PAC',
        consequencesDescription: 'Evita derramamento de sangue e estabiliza temporariamente o Planalto, mas dilui o controle soberano e entrega segredos militares de defesa à oposição patrocinada de Letícia.',
        effect: {
          intelPointsChange: -30,
          popularSupportChange: -10,
          politicalStabilityChange: 30,
          globalInfluenceChange: 15,
          logMessage: 'Albuquerque assumiu o controle das comunicações estratégicas. No mesmo dia, Mike Connors registrou login completo de acesso militar da CIA às antenas receptoras do reservatório de Foz do Iguaçu.'
        }
      },
      {
        id: '2032_B',
        text: 'Chamar os generais legalistas liderados por Roberto Gama para cercar os golpistas',
        consequencesDescription: 'Prende oficiais insurgentes e reafirma a ordem constitucional sob a força do canhão, maximizando o moral militar de prancheta, ao custo de sérias fraturas sociais.',
        effect: {
          intelPointsChange: 30,
          popularSupportChange: 15,
          politicalStabilityChange: -15,
          logMessage: 'O General Roberto Gama coordenou canhões eletrônicos desativadores e isolou os rebeldes cibernéticos. Os insurretos foram mandados à prisão militar em MS, mas focos guerrilheiros se exilaram em Ciudad del Este.'
        }
      }
    ]
  },
  2033: {
    id: 'PREQ_2033',
    title: 'O Dossiê do General Gama e Drones nos Ares de Foz',
    description: 'Chegamos ao clímax da tensão. O General Roberto Gama entrega ao Presidente Mendonça um dossiê forense completo provando que o Paraguai uniu o Data Center chinês da Huawei aos backdoors da fiação subterrânea da State Grid e sistemas de mísseis americanos Bradley no Chaco. Sob o pretexto de "Exercício Dragão de Prata", um cardume de microdrones furtivos é detectado circundando as turbinas estatais de Itaipu de madrugada de forma contínua.',
    image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=400',
    category: 'MILITAR',
    choices: [
      {
        id: '2033_A',
        text: 'Ignorar o dossiê militar para preservar capitais comerciais e pacificar mercados',
        consequencesDescription: 'Não alarmará a imprensa e as exportações agrícolas, mas deixará as baterias e trincheiras de Itaipu e Foz do Iguaçu totalmente desarmadas ante a invasão iminente do Dia Zero.',
        effect: {
          fundsChange: 40,
          fuelReserveChange: 20,
          popularSupportChange: -10,
          politicalStabilityChange: 20,
          relationChange: { PARAGUAI: 10 },
          logMessage: 'Mendonça arquivou o dossiê confidencial emitindo "Nota de Calma e Cooperação Bi-Nacional". Os batalhões de Foz permaneceram em rotina convencional indefesa.'
        }
      },
      {
        id: '2033_B',
        text: 'Decretar alerta de prontidão máxima de guerra eletrônica em Itaipu',
        consequencesDescription: 'Manda contingentes blindados e o sargento Azevedo para o front imediatamente, aumentando as tropas nas defesas da região (+10 tropas em Foz e Itaipu grátis), mas consome vultosos recursos.',
        effect: {
          fundsChange: -40,
          fuelReserveChange: -40,
          popularSupportChange: 25,
          politicalStabilityChange: -10,
          relationChange: { PARAGUAI: -30 },
          logMessage: 'O Alerta Vermelho foi assinado de madrugada. O sargento Lucas Azevedo fortificou as turbinas operárias brasileiras com telas de concreto eletrocondutor. O sargento Miguel Rojas do Paraguai percebeu a movimentação armada ativa.'
        }
      }
    ]
  }
};

// Eventos Históricos do Prequel para o Paraguai (2024 - 2033)
export const PREQUEL_EVENTS_PARAGUAI: Record<number, GameEvent> = {
  2024: {
    id: 'PREQ_2024',
    title: 'Construção do Mega Data Center da Huawei em Ciudad del Este',
    description: 'A gigante tecnológica chinesa Huawei, associada à State Grid de Pequim, propõe a instalação de um Data Center Sólido de Inteligência Artificial adjacente a Itaipu. Sob o pretexto de prestar apoio tático e otimização de infraestrutura, eles requerem o desvio prioritário e de baixo custo de duas turbinas sob cota paraguaia para alimentar o complexo de Shenzhen.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    choices: [
      {
        id: '2024_A',
        text: 'Apoiar a instalação chinesa em troca de subvenções e dados para Assunção',
        consequencesDescription: 'Garante fundos extraordinários e dados analíticos imediatos para o gabinete paraguaio, mas cede parte da autonomia operatória de Itaipu.',
        effect: {
          fundsChange: 80,
          intelPointsChange: 40,
          popularSupportChange: 15,
          politicalStabilityChange: 10,
          globalInfluenceChange: 15,
          logMessage: 'O complexo da Huawei em Ciudad del Este foi autorizado com regozijo pela junta de Assunção. O diretor Li Wei celebrou o escoamento estratégico e transferiu créditos científicos e servidores automatizados.'
        }
      },
      {
        id: '2024_B',
        text: 'Rejeitar a cessão e reter controle exclusivo sobre nossas turbinas binacionais',
        consequencesDescription: 'Preserva a soberania tecnológica, mas resulta em corte imediato de créditos industriais e hostilidade cibernética silenciosa com Pequim.',
        effect: {
          fundsChange: -20,
          intelPointsChange: -10,
          popularSupportChange: -10,
          politicalStabilityChange: -15,
          globalInfluenceChange: -15,
          relationChange: { BRASIL: 10 },
          logMessage: 'O general Santiago Caballero bloqueou a cessão barata de megawatts para a Huawei. Pequim suspendeu investimentos digitais paralelos em infraestrutura viária nacional.'
        }
      }
    ]
  },
  2025: {
    id: 'PREQ_2025',
    title: 'Modernização de Redes e a Instalação Oculta de Backdoors',
    description: 'Equipes técnicas paraguaias lideradas pela Tenente-Coronel Lúcia Espínola aproveitam as obras de reestruturação física da State Grid paraguaia para embutir chips eletrônicos secundários de controle oculto (backdoors) nas linhas que interconectam a rede do Sudeste do Brasil. Uma comissão da Abin, contudo, realiza vistorias frequentes na Ponte da Amizade.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    choices: [
      {
        id: '2025_A',
        text: 'Instalar backdoors táticos de forma agressiva nos canais de transmissão do Iguaçu',
        consequencesDescription: 'Especialistas paraguaios ganham canais diretos de interrupção e coleta de dados de grid (+55 PI), mas exacerba instabilidades externas se descobertos.',
        effect: {
          intelPointsChange: 55,
          fundsChange: -20,
          popularSupportChange: 10,
          relationChange: { BRASIL: -20 },
          logMessage: 'A consolidação dos backdoors táticos foi obtida com sucesso pelas equipes de Lúcia Espínola, abrindo vulnerabilidades indeléveis no grid principal do Paraná.'
        }
      },
      {
        id: '2025_B',
        text: 'Limitar as modificações para manter discrição absoluta e evitar a auditoria brasileira',
        consequencesDescription: 'Evita incidentes diplomáticos com Brasília e preserva as rotas de comércio, mas atrasa nosso braço cibernético.',
        effect: {
          intelPointsChange: 10,
          fundsChange: 40,
          politicalStabilityChange: 15,
          logMessage: 'O gabinete determinou cautela absoluta. O plano invasivo foi mitigado, silenciando os alarmes defensivos que a Abin operava em Foz.'
        }
      }
    ]
  },
  2026: {
    id: 'PREQ_2026',
    title: 'Infiltração Sistêmica da Operação CIA de Mike Connors',
    description: 'O experiente oficial da CIA Mike Connors contata secretamente comandantes de guarnição paraguaios com uma proposta: conceder fundos táticos sigilosos e atualizações táticas orbitais em troca de acessos decodificadores ao fluxo energético do Data Center de Ciudad del Este.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    choices: [
      {
        id: '2026_A',
        text: 'Concordar com as remessas clandestinas e assessoria militar secreta da CIA',
        consequencesDescription: 'Alimenta nossa inteligência geopolítica com canais americanos de Langley (+60 PI), contornando as restrições industriais de Brasília.',
        effect: {
          intelPointsChange: 60,
          globalInfluenceChange: 25,
          fundsChange: 40,
          politicalStabilityChange: -10,
          logMessage: 'Caballero autorizou a assessoria confidencial da CIA. Antenas e cartões de escuta de alta frequência americanos foram instalados nas franjas do Chaco.'
        }
      },
      {
        id: '2026_B',
        text: 'Repelir Mike Connors e banir agentes americanos do comitê militar de Assunção',
        consequencesDescription: 'Afiança o orgulho patriótico da junta soberana nas rádios estatais, ao custo de completo isolamento diplomático e espionagem de Langley.',
        effect: {
          intelPointsChange: -20,
          globalInfluenceChange: -20,
          popularSupportChange: 25,
          politicalStabilityChange: 20,
          logMessage: 'Connors foi forçado a recuar sob censura de Caballero. O Departamento de Estado americano congelou as subvenções agrícolas do algodão paraguaio.'
        }
      }
    ]
  },
  2027: {
    id: 'PREQ_2027',
    title: 'Sequestro Criptográfico nos Portos do Sul (Santos e Paranaguá)',
    description: 'Hackers patriotas paraguaios desferem um ransomware devastador que paralisa as esteiras de exportação dos Portos de Paranaguá e Santos. Devido à imensa paralisia do diesel e cargas agrícolas do Cone Sul, eles exigem o resgate financeiro imediato das contas brasileiras.',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    choices: [
      {
        id: '2027_A',
        text: 'Manter a infiltração cibernética até a consolidação de fundos e de dados operantes do sul',
        consequencesDescription: 'Adquire vultosos fundos de resgate tático (+40 F$) e mapas essenciais de logística rodoviária brasileira, abalando a relação diplomática.',
        effect: {
          intelPointsChange: 40,
          fundsChange: 40,
          popularSupportChange: 15,
          relationChange: { BRASIL: -30 },
          logMessage: 'Santos e Paranaguá ficaram asfixiados por dias. O pagamento secreto do Banco Central brasileiro abasteceu as agências especiais paraguaias.'
        }
      },
      {
        id: '2027_B',
        text: 'Desativar o vetor remoto para blindar-se taticamente contra sanções de Brasília',
        consequencesDescription: 'Evita acusações instantâneas de guerra cibernética pelas Forças Especiais do Rio Paraná, resguardando nosso perfil diplomático.',
        effect: {
          fundsChange: -15,
          politicalStabilityChange: 15,
          relationChange: { BRASIL: 15 },
          logMessage: 'O sinal do sequestrador foi desativado sem resgate. A diplomacia bilateral de Itaipu transcorreu sem conflito formal imediato pelas margens.'
        }
      }
    ]
  },
  2028: {
    id: 'PREQ_2028',
    title: 'O Reset de Firmware Remoto dos Blindados Bradley no Chaco',
    description: 'Uma pane sistêmica orquestrada secretamente por Langley trava os motores e miras eletrônicas de doze blindados Bradley das forças paraguaias e do Chaco. O General Eladio Franco exige uma intervenção imediata para reverter a desativação cibernética americana.',
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    choices: [
      {
        id: '2028_A',
        text: 'Transigir com os americanos em troca de pacotes lentos de reparo oficial',
        consequencesDescription: 'Evita atritos com Washington e Mike Connors, mas deixa as colunas blindadas paraguaias inativas por longos meses.',
        effect: {
          globalInfluenceChange: 15,
          fundsChange: 30,
          intelPointsChange: -10,
          popularSupportChange: -15,
          logMessage: 'O gabinete de Assunção dobrou-se ao comissariado da CIA. Os Bradley paraguaios permaneceram lacrados nas bases de quartel sem as ignições principais.'
        }
      },
      {
        id: '2028_B',
        text: 'Reprogramar o firmware em Ciudad del Este com microprocessadores chineses Loongson',
        consequencesDescription: 'Consome recursos, mas reativa por completo nossa infantaria agressiva e sela proximidade tática de ação com o Chaco.',
        effect: {
          fundsChange: -30,
          fuelReserveChange: 50,
          intelPointsChange: 30,
          relationChange: { COALIZAO_CHACO: 25 },
          popularSupportChange: 20,
          logMessage: 'Técnicos paraguaios, auxiliados por engenheiros de Ciudad del Este, romperam a criptografia americana e subiram o firmware alternativo Loongson.'
        }
      }
    ]
  },
  2029: {
    id: 'PREQ_2029',
    title: 'Disparos de Drones paraguaios Wing Loong sobre a Lagoa Seca',
    description: 'Nossos drones de asfalto Wing Loong operam reconhecimento tático crítico ao norte de Itaipu. Durante manobras de aferição de baterias brasileiras, um dos vetores ultrapassa as demarcações de fronteira do Mato Grosso do Sul de madrugada.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=400',
    category: 'MILITAR',
    choices: [
      {
        id: '2029_A',
        text: 'Manter a incursão audaciosa colhendo pontos cegos de radar e resposta da Abin',
        consequencesDescription: 'Decodifica coordenadas e rotas estratégicas de artilharia inimigas (+45 PI), ao custo de forte incidente armado com São Paulo.',
        effect: {
          intelPointsChange: 45,
          popularSupportChange: 20,
          relationChange: { BRASIL: -25 },
          logMessage: 'Os drones paraguaios conseguiram mapear as defesas da Abin em MS, porém uma saraivada térmica antiaérea brasileira abateu um Wing Loong sobre o iguaçu.'
        }
      },
      {
        id: '2029_B',
        text: 'Retroceder o drone visando blindar a confidencialidade da mobilização militar',
        consequencesDescription: 'Resguarda o vetor aéreo e afasta acusações imediatas no Rio Paraná, mas adia o mapeamento das metralhas brasileiras.',
        effect: {
          intelPointsChange: 10,
          politicalStabilityChange: 15,
          fundsChange: 20,
          logMessage: 'O vetor paraguaio retornou intacto à base de Ciudad del Este. Caballero obteve pouca informação, mas manteve sigilo relativo das ações paraguaias.'
        }
      }
    ]
  },
  2030: {
    id: 'PREQ_2030',
    title: 'Sanções Cibernéticas e o Boicote de Chips da Nvidia/AMD',
    description: 'Pressionados pelo Planalto brasileiro, consórcios mundiais restringem o embarque de componentes de alta performance eletrônica para nossas centrais de defesa. Precisamos obter novas unidades de computação gráfica de tiro tático.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
    category: 'DIPLOMATICO',
    choices: [
      {
        id: '2030_A',
        text: 'Fechar compromisso imediato com Pequim pelos semicondutores Loongson',
        consequencesDescription: 'Restaura a inteligência cibernética militar através das conexões da Huawei em Ciudad del Este, aumentando o peso chinês.',
        effect: {
          fundsChange: -25,
          intelPointsChange: 40,
          globalInfluenceChange: -15,
          popularSupportChange: 10,
          logMessage: 'Remessas marítimas chinesas reequiparam nossos datacenters de Assunção dadas as rotas e direitos aduaneiros que compartilhamos no Paraná.'
        }
      },
      {
        id: '2030_B',
        text: 'Importar lotes por contrabando encarecido subterrâneo no Chaco',
        consequencesDescription: 'Mantém nosso perfil neutro perante os americanos, mas esvazia drasticamente os fundos nacionais de contingência cambial.',
        effect: {
          fundsChange: -55,
          intelPointsChange: 20,
          globalInfluenceChange: 15,
          logMessage: 'Pagamos taxas inflacionárias enormes para angariar os chips por mercenários e frotas de fronteira, resguardando nossa independência diplomática.'
        }
      }
    ]
  },
  2031: {
    id: 'PREQ_2031',
    title: 'A Greve Continental de Caminhoneiros do Cone Sul',
    description: 'Sindicatos de frete interestadual e caminhoneiros cruzam os braços nas autoestradas da bacia do Paraná. O tráfego comercial com o Brasil é interrompido completamente, travando o reabastecimento logístico nos quartéis paraguaios de fronteira.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    choices: [
      {
        id: '2031_A',
        text: 'Injetar emendas de combustível barato para aliviar as frotas na Ponte da Amizade',
        consequencesDescription: 'Reabre pacificamente as vias no dia seguinte, reativando a cadeia de munição e óleo militar, ao custo de sérios fundos.',
        effect: {
          fundsChange: -50,
          fuelReserveChange: 40,
          popularSupportChange: 20,
          politicalStabilityChange: 20,
          logMessage: 'O barateamento de combustível tático restabeleceu o fluxo das estradas. Nossos comitês em Ciudad del Este retomaram a cadência de provisões.'
        }
      },
      {
        id: '2031_B',
        text: 'Proceder por frotas fluviais de contingência abandonando as rotas rodoviárias',
        consequencesDescription: 'Evita repasses de verbas governamentais, mas asfixia consideravelmente o diesel leve do exército de Assunção.',
        effect: {
          fuelReserveChange: -40,
          popularSupportChange: -20,
          politicalStabilityChange: -15,
          logMessage: 'O frete fluvial foi exaustivamente demorado. Nossos soldados enfrentaram severa escassez de óleo diesel e rações táticas por semanas.'
        }
      }
    ]
  },
  2032: {
    id: 'PREQ_2032',
    title: 'Coup Attempt: Mobilização Civil-Militar contra Assunção',
    description: 'Células dissidentes instigadas por transmissões externas cercam as guaritas presidenciais da junta em Assunção. Exigindo a deposição imediata do general Santiago Caballero e um recuo diplomático completo de Itaipu, eles marcham armados.',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    choices: [
      {
        id: '2032_A',
        text: 'Compor pacto de paz civil acomodando liberais no ministério governamental',
        consequencesDescription: 'Previne confrontos violentos imediatos na capital, mas expõe dados soberanos do plano de defesas eletrônicas à infiltração da oposição.',
        effect: {
          intelPointsChange: -25,
          politicalStabilityChange: 35,
          popularSupportChange: 10,
          globalInfluenceChange: 15,
          logMessage: 'O armistício interno foi assinado por Caballero. Representantes oposicionistas assumiram cargos estratégicos de monitoramento de rádio tático.'
        }
      },
      {
        id: '2032_B',
        text: 'Acionar as divisões de choque do Sargento Miguel Rojas e reprimir a sublevação',
        consequencesDescription: 'Garante a autoridade inabalada da junta militar, mas gera passeatas indignadas e severo isolamento humanitário global.',
        effect: {
          popularSupportChange: -25,
          politicalStabilityChange: -15,
          intelPointsChange: 40,
          fuelReserveChange: 20,
          logMessage: 'A tropa legalista de Rojas limpou os acessos com bombas inertes de artilharia. Ativistas fugiram exilados para o Mato Grosso do Sul.'
        }
      }
    ]
  },
  2033: {
    id: 'PREQ_2033',
    title: 'O Dossiê do General Gama e Drones nos Ares de Foz',
    description: 'No clímax histórico, patrulhas de fronteira revelam que o exército brasileiro assinou alerta tático vermelho. As margens brasileiras do Paraná estão densamente vigiadas por batalhões blindados do general Gama. Choques violentos são iminentes.',
    image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=400',
    category: 'MILITAR',
    choices: [
      {
        id: '2033_A',
        text: 'Prorrogar diálogos de fronteira com Brasília para ganhar tempo operacional de retaguarda',
        consequencesDescription: 'Evita a deflagração bélica instantânea por canais de imprensa, mas ingressa no Dia Zero sem frentes de infantaria preparadas no iguaçu.',
        effect: {
          fundsChange: 30,
          popularSupportChange: -10,
          politicalStabilityChange: 20,
          relationChange: { BRASIL: 15 },
          logMessage: 'Assunção manteve discursos bilaterais cautelosos. Nossos pelotões de fuzil em Ciudad del Este continuaram em estado operacional negligente.'
        }
      },
      {
        id: '2033_B',
        text: 'Assinar o Alerta Vermelho de Combate e posicionar regimentos de assalto de infantaria',
        consequencesDescription: 'Provê brigadas paraguaias guarnecidas prontas para combate (+10 de tropas grátis em Ciudad del Este e Assunção), ao custo de alto capital bélico.',
        effect: {
          fundsChange: -40,
          fuelReserveChange: -40,
          popularSupportChange: 30,
          politicalStabilityChange: -10,
          relationChange: { BRASIL: -35 },
          logMessage: 'Caballero expediu o Alerta de Soberania Pátria. O sargento Rojas comandou comboios de artilharia para as margens de Itaipu. O combate está definido!'
        }
      }
    ]
  }
};

// Eventos ativos do jogo (Pós-2034) para Turno a Turno
// Criamos uma lista flexível de templates temáticos para garantir dinamicamente até 100+ eventos!
// Cada evento possui um gerador de escolhas inteligentes que se adapta ao estado de recursos do jogador.

export interface ProceduralEventTemplate {
  title: string;
  description: string;
  image: string;
  category: 'MILITAR' | 'DIPLOMATICO' | 'INFRAESTRUTURA' | 'REMANCENTES';
  logA: string;
  logB: string;
}

export const PROCEDURAL_EVENT_TEMPLATES: ProceduralEventTemplate[] = [
  // WAR PREPARATION
  {
    title: 'Recrutamento Extraordinário nas Escolas do Paraná',
    description: 'O Alto Comando em Brasília sugere engajar universitários e voluntários civis de Foz do Iguaçu em cursos expressos de logística balística e enfermagem de campanha tática. A comissão humanitária de Maria Clara apoia o engajamento tático, mas teme militarizar jovens civis precocemente.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400',
    category: 'MILITAR',
    logA: 'O recrutamento extraordinário engajou 3.000 jovens voluntários como auxiliares táticos nas bases industriais avançadas do Sul.',
    logB: 'Decidimos manter apenas combatentes formados e de carreira ativa na esquadra do Rio Paraná, resguardando o moral público civil das vilas de Foz do Iguaçu.'
  },
  {
    title: 'Estocagem Estratégica de Combustível Hidrocarboneto no MS',
    description: 'Nossa inteligência sugere desviar fundos federais emergenciais para requisitar frotas de caminhonetes de suprimento em MS e estocar óleo pesado para manter tanques blindados aquecidos e funcionais sob tempestades sazonais na fronteira.',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400',
    category: 'MILITAR',
    logA: 'Os tambores de diesel pesado foram estocados com sucesso nas trincheiras próximas à fronteira do Chaco.',
    logB: 'Optamos por investir os fundos em armas de infantaria leve, deixando os blindados vulneráveis à instabilidade de combustível tático.'
  },
  
  // CIA OPS
  {
    title: 'Célula Oculta em Brasília Descoberta pelo Rádio de Seu Manoel',
    description: 'Através de transmissões clandestinas UHF rastreadas no Mato Grosso do Sul, Seu Manoel intercepta coordenadas cifradas de agentes estrangeiros da CIA operando de um sítio secreto nos arredores do Distrito de Brasília.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    logA: 'Invadimos o sítio espião e apreendemos interceptores de Langley acoplados a computadores diplomáticos russos e chineses.',
    logB: 'Preferimos apenas monitorar a transmissão secreta, obtendo microdados diários do fluxo logístico militar que transita de Assunção.'
  },
  {
    title: 'Campanha de Subversão em Rádios Fronteiriças de Mike Connors',
    description: 'Estações transmissoras clandestinas financiadas pela rede de Mike Connors nos limites do Chaco espalham rumores de que o Brasil usará armas incendiárias químicas em Itaipu, minando severamente a moral de nossas guarnições.',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    logA: 'Silenciamos as antenas clandestinas com descargas eletromagnéticas aéreas coordenadas pelo General Gama.',
    logB: 'Demos foco a propagar transmissões oficiais opostas por canais estatais, embora o recesso de moral tenha afetado os oficiais em Foz.'
  },

  // CHINESE OPS
  {
    title: 'O Desvio Algorítmico do Consumo de Itaipu por Li Wei',
    description: 'Técnicos de engenharia de Foz constatam que o Data Center Soberano de Li Wei em Ciudad del Este sutilmente reconfigura códigos computacionais para desviar 15 megawatts extras e processar simulações de artilharia paraguaia.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    logA: 'Cortamos de imediato os cabos de shunt auxiliares clandestinos na margem esquerda do iguaçu sob fuzilaria avançada.',
    logB: 'Evitamos confrontação física no shunt do iguaçu para não melindrar Pequim, amargando a drenagem sistemática de nossa energia nacional.'
  },

  // BRAZILIAN POLITICAL CRISIS
  {
    title: 'Letícia Albuquerque Convoca Coletiva Crítica no Senado',
    description: 'Em acalorado debate político em Brasília, a opositora Letícia Albuquerque exibe imagens satélite de trincheiras de Itaipu e culpa a letargia de Alberto Mendonça por expor soldados voluntários em táticas suicidas ao sul.',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400',
    category: 'DIPLOMATICO',
    logA: 'O presidente Mendonça rebateu demonstrando os relatórios de defesa técnica do general Gama, unindo a opinião soberana pública.',
    logB: 'Mendonça cedeu parte das subvenções agrícolas em MS para silenciar a oposição de Letícia, drenando capitais estatais.'
  },

  // PARAGUAYAN NATIONALISM
  {
    title: 'A Batalha Histórica de Acosta Ñu Rememorada na Rádio paraguaia',
    description: 'Sermões inflamados do General Caballero na rádio militar de Assunção relembram em lágrimas emotivas a morte de crianças soldados na guerra de 1869, instigando fúria insustentável nas colunas de infantaria do sargento Rojas.',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400',
    category: 'DIPLOMATICO',
    logA: 'Bloqueamos o sinal de UHF da rádio paraguaia sob forte campanha cibernética tática conduzida de Foz do Iguaçu.',
    logB: 'Ignoramos o apelo patriota das ondas curtas, amargando forte aumento na eficiência mútua ofensiva paraguaia na fronteira.'
  },

  // INFRASTRUCTURE
  {
    title: 'Instabilidade Térmica nos Transformadores Primários de Itaipu',
    description: 'A rede cibernética acusa superaquecimento no óleo mineral de isolamento das bobinas gigantes da margem brasileira, possivelmente acionado pela tenente-coronel Lúcia Espínola por comandos backdoor antigos.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    logA: 'Injetamos nitrogênio líquido emergencial de nossas reservas de suprimentos de Foz para precaver o blackout sistêmico.',
    logB: 'Reduzimos temporariamente o faturamento e fornecimento energético para baixar o calor térmico das bobinas de Itaipu.'
  },

  // ESPIONAGE
  {
    title: 'Localização de Posição de Bateria de Mísseis Detectada pela Laura Ferreira',
    description: 'De seu exílio voluntário, a destemida jornalista investigativa Laura Ferreira desvenda a coordenada exacta onde os paraguaios instalaram radares defensivos no Chaco dedicados a abater aviões táticos de Curitiba.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
    category: 'REMANCENTES',
    logA: 'Enviamos comandos furtivos de blindados em MS guiados por Seu Manoel para destruir os radares do Chaco de relance.',
    logB: 'Usamos as posições reveladas apenas para desviar nossas aeronaves táticas de ataque, minimizando os voos de caças pesados.'
  },

  // CYBER WARFARE
  {
    title: 'Ataque de Negação de Serviço contra Servidores Industriais',
    description: 'Inundação cibernética massiva de pacotes digitais sincronizados derruba o controle estratégico dos trens de carga em MS, ameaçando descarrilamentos de suprimentos.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
    category: 'INFRAESTRUTURA',
    logA: 'Desviamos computadores analíticos da Inteligência Militar para isolar a tempestade IP com barreiras nacionais de firewall.',
    logB: 'Operamos a logística tática em modo manual simplificado, sofrendo pesados atrasos materiais de escoamento no front sul.'
  },

  // PROPAGANDA
  {
    title: 'Maria Clara Discursa para Imprensa Estrangeira em Foz',
    description: 'A dedicada voluntária Maria Clara convoca correspondentes da Europa na lagoa civil de Foz para relatar o estigma brutal de famílias civis atingidas por morteiros de artilharia paraguaios no Dia Zero.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    category: 'DIPLOMATICO',
    logA: 'Garantimos subsídios financeiros extras ao amparo humanitário, atraindo imensa simpatia das agências diplomáticas mundiais.',
    logB: 'Optamos por censurar e desviar os repórteres franceses para resguardar a rigidez de segredos militares do general Roberto Gama.'
  },

  // CIVILIAN EVENTS
  {
    title: 'Hospital de Fronteira no Limite Humano na Zona Cinzenta',
    description: 'A dedicada Dra. Jéssica Méndez relata que a ala cirúrgica avançada está sem geradores e sedativos suficientes devido ao violento assalto às margens do Rio Paraná.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    category: 'DIPLOMATICO',
    logA: 'Enviamos caminhões blindados carregados de oxigênio e medicamentos sob proteção do Capitão Lucas Azevedo.',
    logB: 'Decidimos focar todos os suprimentos sanitários exclusivamente nos regimentos de artilharia do General Gama e Foz.'
  },

  // MILITARY EVENTS
  {
    title: 'Fuga de Informações do Comando Cibernético Paraguaio',
    description: 'Uma criptochave interceptada de oficiais ligados à Lúcia Espínola expõe o plano paraguaio de sabotar as turbinas auxiliares de Itaipu de madrugada por mergulhadores táticos.',
    image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=400',
    category: 'MILITAR',
    logA: 'Posicionamos patrulhas de mergulhadores táticos do sargento Lucas Azevedo interceptando e eliminando a ameaça anfíbia.',
    logB: 'Optamos por evacuar e desligar as turbinas preventivamente, gerando imensa perda de Megawatts para o Sudeste brasileiro.'
  },

  // DIPLOMATIC NEGOTIATIONS
  {
    title: 'A Mediação Pacífica do Senador Ricardo Benítez',
    description: 'O senador paraguaio Ricardo Benítez propõe secretamente em conferência virtual neutra o fim das hostilidades no reservatório de Itaipu sob mediação financeira da diplomacia de Buenos Aires.',
    image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400',
    category: 'DIPLOMATICO',
    logA: 'Aceitamos avaliar os termos bi-nacionais, injetando dinamismo na nossa influência internacional perante a ONU.',
    logB: 'Rejeitamos o armistício provisório, emitindo mísseis contra os quartéis de Assunção e exigindo rendição militar incondicional.'
  }
];

// Função que proceduralmente gera eventos para expandir dinamicamente para até 100+ eventos
// de forma leve, robusta e adaptável ao estado de jogo do participante.
export function generateProceduralEvent(turn: number, gameState: GameState): GameEvent {
  const index = (turn + gameState.intelPoints) % PROCEDURAL_EVENT_TEMPLATES.length;
  const template = PROCEDURAL_EVENT_TEMPLATES[index];
  
  // Customização dinâmica com base no turno para garantir unicidade perfeita de id e títulos
  const eventId = `EVT_PROC_${turn}`;
  const displayTitle = `${template.title} (Turno ${turn})`;
  const finalDescription = `${template.description} As reservas nacionais apontam Ativo de Fundos em: ${gameState.factions['BRASIL'].resources.funds} Bilhões e Suprimentos de Guerra em: ${gameState.factions['BRASIL'].resources.supplies} Unidades de Abastecimento.`;

  return {
    id: eventId,
    title: displayTitle,
    description: finalDescription,
    image: template.image,
    category: template.category,
    choices: [
      {
        id: `${eventId}_A`,
        text: `Decisão Sobriedade: ${template.logA.slice(0, 50)}...`,
        consequencesDescription: 'Gera impacto tático e estabiliza o moral local ao custo de provisões militares directas.',
        requiredFunds: gameState.factions['BRASIL'].resources.funds > 40 ? 30 : 0,
        effect: {
          fundsChange: gameState.factions['BRASIL'].resources.funds > 40 ? -30 : 15,
          suppliesChange: -20,
          nationalMoraleChange: 10,
          popularSupportChange: 15,
          intelPointsChange: 15,
          politicalStabilityChange: 10,
          logMessage: `${template.logA} Nossos diplomatas e generais coordenaram a ação de forma estrita no centro de operações.`
        }
      },
      {
        id: `${eventId}_B`,
        text: `Alternativa Prudente: ${template.logB.slice(0, 50)}...`,
        consequencesDescription: 'Evita consumo de capitais operacionais imediatos, amargando debilidades no moral e influência de Washington ou Assunção.',
        effect: {
          fundsChange: 30,
          suppliesChange: 15,
          nationalMoraleChange: -15,
          popularSupportChange: -15,
          intelPointsChange: -10,
          globalInfluenceChange: -10,
          politicalStabilityChange: -15,
          logMessage: `${template.logB} O comando central optou pela prudência tática defensiva nacional, resguardando os cofres da nação.`
        }
      }
    ]
  };
}

// Retorna o evento adequado baseado na localização histórica
export function getActiveCampaignEvent(gameState: GameState): GameEvent | null {
  if (gameState.timelineProgress === 'PREQUEL') {
    const year = gameState.prequelYear;
    // Se o evento do ano atual já foi resolvido, não retorna
    if (gameState.resolvedPrequelEvents.includes(`PREQ_${year}`)) {
      return null;
    }
    return gameState.playerFaction === 'PARAGUAI'
      ? PREQUEL_EVENTS_PARAGUAI[year] || null
      : PREQUEL_EVENTS[year] || null;
  }
  
  // Se estiver em modo guerra e não tiver evento ativo, gera um dinâmico/procedural
  return null;
}
