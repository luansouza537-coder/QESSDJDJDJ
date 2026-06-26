/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import requirements if needed, otherwise self-contained
export type CharacterRole = 'GENERAL' | 'ESPIAO' | 'DIPLOMATA';

export interface CharacterSkills {
  strategy: number;       // 1-10 (Combate, fortificação, infantaria)
  charisma: number;       // 1-10 (Negociação com facções, moral das tropas)
  intrigue: number;       // 1-10 (Infiltração, sabotagem, intel)
  administration: number; // 1-10 (Logística, geração de recursos, estabilidade)
}

export type CharacterStatus = 'DISPONIVEL' | 'EM_MISSAO' | 'LESIONADO';

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  faction: 'BRASIL' | 'PARAGUAI' | 'COALIZAO_CHACO' | 'MERCENARIOS' | 'EUA' | 'CHINA' | 'INTERNACIONAL';
  avatar: string;
  skills: CharacterSkills;
  morale: number;         // Individual 1-100
  status: CharacterStatus;
  location: 'ITAIPU' | 'FOZ_DO_IGUACU' | 'CIUDAD_DEL_ESTE' | 'CHACO' | 'ASSUNCAO' | 'MATO_GROSSO_SUL' | 'BRASILIA' | 'RESERVA';
  currentMissionDescription: string | null;
  turnsInMissionLeft: number;
  title: string;          // Cargo
  bio: string;            // Biografia
  popularity: number;     // Popularidade (0-100)
  influence: number;      // Influência (0-100)
  loyalty: number;        // Lealdade (0-100)
  specialAbility: string; // Habilidade Especial
  lifeStatus: 'VIVO' | 'MORTO' | 'PRESO' | 'DESAPARECIDO'; // Status vital
  relatedEvents?: string[]; // Eventos relacionados
}

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'gama',
    name: 'General Roberto Gama',
    role: 'GENERAL',
    faction: 'BRASIL',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 9, charisma: 7, intrigue: 5, administration: 8 },
    morale: 85,
    status: 'DISPONIVEL',
    location: 'FOZ_DO_IGUACU',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Comandante da Operação de Defesa do Sul',
    bio: 'Especialista técnico em guerra eletrônica e segurança de infraestrutura. Passou os últimos 10 anos alertando o governo sobre as sabotagens e redes ocultas paraguaias em Itaipu.',
    popularity: 75,
    influence: 85,
    loyalty: 90,
    specialAbility: 'Guerra de Frequências (Aumenta o dano do atacante e reduz baixas aliadas em 15%)',
    lifeStatus: 'VIVO',
    relatedEvents: ['gamareport', 'droneoveritaipu']
  },
  {
    id: 'mendonca',
    name: 'Presidente Alberto Mendonça',
    role: 'DIPLOMATA',
    faction: 'BRASIL',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 3, charisma: 8, intrigue: 4, administration: 9 },
    morale: 70,
    status: 'DISPONIVEL',
    location: 'BRASILIA',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Presidente da República',
    bio: 'Economista acadêmico, eleito sob a bandeira de conciliação. Tentou usar vias pacíficas e diplomáticas para renegociar Itaipu, ignorando os riscos de conflito iminente até o Dia Zero.',
    popularity: 55,
    influence: 95,
    loyalty: 100,
    specialAbility: 'Orçamento de Emergência (+25% de fundos gerados no Distrito de Brasília)',
    lifeStatus: 'VIVO',
    relatedEvents: ['coupattempt', 'coupattempt2']
  },
  {
    id: 'albuquerque',
    name: 'Deputada Letícia Albuquerque',
    role: 'DIPLOMATA',
    faction: 'BRASIL',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 2, charisma: 9, intrigue: 8, administration: 6 },
    morale: 75,
    status: 'DISPONIVEL',
    location: 'BRASILIA',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Líder da Oposição da Frente PAC',
    bio: 'Pragmática e eloquente. Recebeu financiamento clandestino de consultorias fachadas criadas pela CIA em troca de pregar uma rendição e concessões em Itaipu ante o conflito.',
    popularity: 65,
    influence: 80,
    loyalty: 50,
    specialAbility: 'Redes Clandestinas (Gera +5 de Inteligência a cada turno em Brasília)',
    lifeStatus: 'VIVO',
    relatedEvents: ['ciaexposure', 'civilprotest']
  },
  {
    id: 'azevedo',
    name: 'Capitão Lucas Azevedo',
    role: 'GENERAL',
    faction: 'BRASIL',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 8, charisma: 8, intrigue: 3, administration: 4 },
    morale: 100,
    status: 'DISPONIVEL',
    location: 'ITAIPU',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Comandante do Destacamento de Fronteira',
    bio: 'Comandante do setor de vigilância norte no Dia Zero. Sacrificou-se para adiar o avanço blindado oponente sobre as turbinas estratégicas.',
    popularity: 90,
    influence: 55,
    loyalty: 95,
    specialAbility: 'Último Homem de Pé (+30% Defesa quando a guarnição de Itaipu tiver menos de 10 tropas)',
    lifeStatus: 'VIVO',
    relatedEvents: ['capitandead', 'dayzero']
  },
  {
    id: 'clara',
    name: 'Maria Clara',
    role: 'DIPLOMATA',
    faction: 'BRASIL',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 1, charisma: 9, intrigue: 3, administration: 7 },
    morale: 95,
    status: 'DISPONIVEL',
    location: 'FOZ_DO_IGUACU',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Coordenadora de Amparo Humanitário',
    bio: 'Professora de História em Foz que montou em abrigos e escolas as defesas civis de amparo humanitário, vendo seus próprios antigos estudantes engajarem no front de fogo.',
    popularity: 85,
    influence: 60,
    loyalty: 90,
    specialAbility: 'Escudo Humanitário (Reduz o desgaste do moral público civil em Foz do Iguaçu em -30%)',
    lifeStatus: 'VIVO',
    relatedEvents: ['refugeesfoz', 'humanitariancrisis']
  },
  {
    id: 'manoel',
    name: 'Seu Manoel',
    role: 'DIPLOMATA',
    faction: 'BRASIL',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 3, charisma: 6, intrigue: 4, administration: 8 },
    morale: 80,
    status: 'DISPONIVEL',
    location: 'MATO_GROSSO_SUL',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Representante dos Caminhoneiros Bloqueados',
    bio: 'Veterano das estradas do Cone Sul, preso em bloqueios logísticos orquestrados no PR e MS. Sua rede de comunicações via rádio amador ajuda a resistir à sabotagem logística.',
    popularity: 75,
    influence: 50,
    loyalty: 80,
    specialAbility: 'Rotas do Rádio Amador (Gera +15 de suprimentos por turno no MS)',
    lifeStatus: 'VIVO',
    relatedEvents: ['truckerstrike', 'logisticcollapse']
  },
  {
    id: 'caballero',
    name: 'General Santiago Caballero',
    role: 'GENERAL',
    faction: 'PARAGUAI',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 8, charisma: 9, intrigue: 8, administration: 7 },
    morale: 95,
    status: 'DISPONIVEL',
    location: 'ASSUNCAO',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Presidente do Paraguai e Líder da Junta Patriótica',
    bio: 'Adido militar destacado em Pequim no passado, concebeu o rearmamento sigiloso do Paraguai, usando as duas maiores potências do mundo a favor de sua vingança histórica de 1870.',
    popularity: 90,
    influence: 100,
    loyalty: 100,
    specialAbility: 'Revanche Patriótica (Aumenta o moral em assaltos à margem esquerda do Rio Paraná)',
    lifeStatus: 'VIVO',
    relatedEvents: ['caballerodecree', 'juntamobilization']
  },
  {
    id: 'espinola',
    name: 'Tenente-coronel Lúcia Espínola',
    role: 'ESPIAO',
    faction: 'PARAGUAI',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 4, charisma: 5, intrigue: 10, administration: 7 },
    morale: 90,
    status: 'DISPONIVEL',
    location: 'CIUDAD_DEL_ESTE',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Comandante de Defesa Cibernética',
    bio: 'Hacker genial. Treinou com equipes chinesas da Huawei e americanas na NSA, e coordenou o apagão tático inicial acionando backdoors nas redes de distribuição brasileiras.',
    popularity: 70,
    influence: 85,
    loyalty: 95,
    specialAbility: 'Blackout de Redes (Suga 30 GW/h das redes brasileiras ao fim de cada turno)',
    lifeStatus: 'VIVO',
    relatedEvents: ['cyberattack', 'backdoorsactivation']
  },
  {
    id: 'benitez',
    name: 'Senador Ricardo Benítez',
    role: 'DIPLOMATA',
    faction: 'PARAGUAI',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 2, charisma: 8, intrigue: 6, administration: 9 },
    morale: 80,
    status: 'DISPONIVEL',
    location: 'ASSUNCAO',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Líder da Oposição Parlamentar',
    bio: 'Economista internacional moderado. Opõe-se ferozmente à influência cibernética chinesa, prevendo que o data center será a mordaça definitiva de Assunção após a guerra.',
    popularity: 60,
    influence: 75,
    loyalty: 70,
    specialAbility: 'Consenso Parlamentar (Gera acordos diplomáticos com +15% de eficiência comercial)',
    lifeStatus: 'VIVO',
    relatedEvents: ['parliamentopposition', 'peaceinitiative']
  },
  {
    id: 'ferreira',
    name: 'Laura Ferreira',
    role: 'ESPIAO',
    faction: 'PARAGUAI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 1, charisma: 9, intrigue: 7, administration: 5 },
    morale: 85,
    status: 'DISPONIVEL',
    location: 'RESERVA',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Jornalista Investigativa Em Exílio',
    bio: 'Atua secretamente de Buenos Aires revelando o rastro bilionário chinês no Chaco e os planos bélicos da junta. Sua caneta de rádio livre é temida pelos oficiais de Assunção.',
    popularity: 80,
    influence: 65,
    loyalty: 60,
    specialAbility: 'Furo Jornalístico (Reduz em -20% o moral adversário ao expor mentiras de propaganda)',
    lifeStatus: 'VIVO',
    relatedEvents: ['clandestinement', 'militarysecrets']
  },
  {
    id: 'franco',
    name: 'General Eladio Franco',
    role: 'GENERAL',
    faction: 'PARAGUAI',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 8, charisma: 7, intrigue: 6, administration: 6 },
    morale: 80,
    status: 'DISPONIVEL',
    location: 'CHACO',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'General Honorário da Reserva',
    bio: 'Veterano e conselheiro lendário nos quartéis. Cético impiedoso sobre a retórica das grandes potências mundiais de ajuda humanitária rápida.',
    popularity: 85,
    influence: 80,
    loyalty: 85,
    specialAbility: 'Olhar Cético (Imunidade a ciber-sabotagens na sua região de defesa)',
    lifeStatus: 'VIVO',
    relatedEvents: ['warningissued', 'veteranopinion']
  },
  {
    id: 'rojas',
    name: 'Sargento Miguel Rojas',
    role: 'GENERAL',
    faction: 'PARAGUAI',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 7, charisma: 8, intrigue: 4, administration: 3 },
    morale: 95,
    status: 'DISPONIVEL',
    location: 'CIUDAD_DEL_ESTE',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Comandante da Vanguarda Fronteiriça',
    bio: 'Jovem sargento focado em lavar em sangue as histórias escolares do massacre de Acosta Ñu. Foi o primeiro a cravar a bota na margem de fuzilamento do Rio Paraná.',
    popularity: 90,
    influence: 50,
    loyalty: 95,
    specialAbility: 'Investida Letal (+20% de fúria no primeiro round de todos combates de assalto)',
    lifeStatus: 'VIVO',
    relatedEvents: ['sargentdead', 'firstcasualties']
  },
  {
    id: 'mendez',
    name: 'Dra. Jéssica Méndez',
    role: 'DIPLOMATA',
    faction: 'PARAGUAI',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 1, charisma: 9, intrigue: 3, administration: 8 },
    morale: 90,
    status: 'DISPONIVEL',
    location: 'CIUDAD_DEL_ESTE',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Diretora Médica do Hospital Binacional',
    bio: 'Médica civil dedicada que se recusa a apartar feridos brasileiros de oponentes paraguaios nas salas de sutura e emergências de Hernandarias.',
    popularity: 88,
    influence: 50,
    loyalty: 80,
    specialAbility: 'Cura Neutra (Acelera a recuperação de oficiais feridos na região em 1 turno)',
    lifeStatus: 'VIVO',
    relatedEvents: ['emergencyroom', 'grayzone']
  },
  {
    id: 'liwei',
    name: 'Li Wei (Pequim - Huawei)',
    role: 'ESPIAO',
    faction: 'CHINA',
    avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 4, charisma: 6, intrigue: 9, administration: 10 },
    morale: 85,
    status: 'DISPONIVEL',
    location: 'CIUDAD_DEL_ESTE',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Diretor Operacional do Data Center Sólido',
    bio: 'Ligado à State Grid e Huawei de Shenzhen. Coordena as conexões críticas do data center chinês que consome duas turbinas exclusivas de Itaipu, secretamente direcionando os backdoors.',
    popularity: 40,
    influence: 90,
    loyalty: 100,
    specialAbility: 'Algoritmo Soberano (Seu data center dobra a produção de inteligência e logística na região)',
    lifeStatus: 'VIVO',
    relatedEvents: ['datacenterbuilt', 'captureliwei']
  },
  {
    id: 'connors',
    name: 'Mike Connors (Langley - CIA)',
    role: 'ESPIAO',
    faction: 'EUA',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    skills: { strategy: 5, charisma: 6, intrigue: 10, administration: 5 },
    morale: 80,
    status: 'DISPONIVEL',
    location: 'BRASILIA',
    currentMissionDescription: null,
    turnsInMissionLeft: 0,
    title: 'Supervisor da Célula Operativa da CIA',
    bio: 'Sua função original era impedir o controle da rede de IA pela China. Acabou orquestrando greves, financiando insurgências e provendo armas no Chaco para enfraquecer o Brasil.',
    popularity: 30,
    influence: 95,
    loyalty: 90,
    specialAbility: 'Infiltração Sistêmica (Gera sabotagens de rede e de fundos oponentes a cada 3 turnos)',
    lifeStatus: 'VIVO',
    relatedEvents: ['ciaexposure', 'subversioncampaign']
  }
];

export const INITIAL_CHARACTERS_DATA = INITIAL_CHARACTERS;

