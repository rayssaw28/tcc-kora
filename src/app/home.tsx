import { isDesktopWeb } from '@/constants/responsive';
import { rotuloBeneficio, rotuloDocumento } from '@/constants/rotulos';
import { color, elevacao, estilos, radius, tomDoNome, tons, type, type NomeTom } from '@/constants/theme';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock3,
  ExternalLink,
  FileText,
  Home,
  LogOut,
  Mail,
  Menu,
  Network,
  Settings,
  UserRound,
  UsersRound,
  ReceiptText,
  Wallet,
  X,
} from 'lucide-react-native';

import { api } from '@/api/client';
import { getTrocaSenhaObrigatoria, limparTrocaSenhaObrigatoria, logout } from '@/api/auth';
import {
  ApiError,
  AtestadoResponse,
  AvaliacaoResponse,
  BeneficioAdminResponse,
  BeneficioLoteRequest,
  BeneficioRequest,
  BeneficioResponse,
  CargoResponse,
  ConsentimentoResponse,
  DadosBancariosResponse,
  DemonstrativoHoleriteResponse,
  DepartamentoResponse,
  DocumentoResponse,
  EspelhoPontoResponse,
  FuncionarioFeedbackResumo,
  FuncionarioResponse,
  FormacaoAcademicaResponse,
  HistoricoAlteracaoFuncionarioResponse,
  HoleriteResponse,
  NotificacaoFuncionarioResponse,
  OrganogramaNode,
  Perfil,
  RequisitoDocumentoResponse,
  StatusAdmissao,
  TermoLgpdResponse,
} from '@/api/types';
import { AlternarTema } from '@/components/AlternarTema';
import { Brilho } from '@/components/Brilho';
import { PessoalSection } from '@/components/PessoalSection';
import {
  DadosBancariosSection,
  FormacaoAcademicaSection,
} from '@/components/PessoalComplementarSections';
import { OrganogramaSection } from '@/components/OrganogramaSection';
import { DocumentosSection } from '@/components/DocumentosSection';
import { AtestadosSection } from '@/components/AtestadosSection';
import { AvaliacoesInicioSection } from '@/components/AvaliacoesInicioSection';
import { AdminBeneficiosSection } from '@/components/AdminBeneficiosSection';
import { AdministracaoSection } from '@/components/AdministracaoSection';
import { GestaoColaboradorActions } from '@/components/GestaoColaboradorActions';
import { HoleritesSection } from '@/components/HoleritesSection';
import { AdminDocumentosSection } from '@/components/AdminDocumentosSection';
import { AdminJornadaSection } from '@/components/AdminJornadaSection';
import { HistoricoGestorSection } from '@/components/HistoricoGestorSection';
import {
  ColaboradoresSection,
  NovoColaborador,
  SecaoColaborador,
} from '@/components/ColaboradoresSection';

type Aba = 'inicio' | 'pessoal' | 'arquivos' | 'rh' | 'holerites' | 'jornada' | 'colaboradores' | 'administracao' | 'org';

type SolicitacaoRh = {
  id: string;
  funcionarioId: number;
  funcionarioNome: string;
  titulo: string;
  descricao: string;
  criadoEm: string;
  secao: SecaoColaborador;
};

type NotificacaoMural = {
  id: string;
  titulo: string;
  descricao: string;
  criadoEm: string;
  aba: Aba;
  funcionarioId?: number;
  secaoColaborador?: SecaoColaborador;
};

const NOTIFICACOES_LIDAS_KEY = 'conformia_notificacoes_lidas';
const AVALIACOES_VISUALIZADAS_KEY = 'conformia_avaliacoes_visualizadas';
const SISTEMA_PONTO_URL = 'https://example.com/integracao-ponto';

const tabs: { id: Aba; label: string; curto: string; topo: string }[] = [
  { id: 'inicio', label: 'Início', curto: 'Início', topo: 'Início' },
  { id: 'pessoal', label: 'Meus dados', curto: 'Meus dados', topo: 'Meus dados' },
  { id: 'arquivos', label: 'Documentos', curto: 'Documentos', topo: 'Documentos' },
  { id: 'rh', label: 'Benefícios e salário', curto: 'Benefícios', topo: 'Benefícios' },
  { id: 'holerites', label: 'Holerites da equipe', curto: 'Holerites', topo: 'Holerites' },
  { id: 'jornada', label: 'Jornada', curto: 'Jornada', topo: 'Jornada' },
  { id: 'colaboradores', label: 'Colaboradores', curto: 'Equipe', topo: 'Colaboradores' },
  { id: 'administracao', label: 'Administração', curto: 'Admin', topo: 'Administração' },
  { id: 'org', label: 'Organograma', curto: 'Organograma', topo: 'Organograma' },
];

const labelsPerfil: Record<Perfil, string> = {
  ADMIN: 'RH',
  GESTOR: 'Gestor',
  FUNCIONARIO: 'Funcionário',
};

const labelsPerfilLongo: Record<Perfil, string> = {
  ADMIN: 'Administrador de RH',
  GESTOR: 'Gestor de equipe',
  FUNCIONARIO: 'Colaborador',
};

const labelsAdmissao: Record<StatusAdmissao, string> = {
  PRE_ADMISSAO: 'Pré-admissão',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação',
  ATIVO: 'Ativo',
  DESLIGADO: 'Desligado',
};

// Guarda a aba aberta para que a troca de tema (que remonta as telas) não volte ao Início.
let abaMemorizada: Aba = 'inicio';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const desktopWeb = isDesktopWeb(width);
  // Menu no topo a partir de 1024px; abaixo disso, barra inferior de app.
  const barraTopo = Platform.OS === 'web' && width >= 1024;
  const colunasInicio = barraTopo ? (width >= 1280 ? 3 : 2) : 1;
  const [aba, setAba] = useState<Aba>(() => abaMemorizada);
  useEffect(() => {
    abaMemorizada = aba;
  }, [aba]);
  const [maisAberto, setMaisAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [me, setMe] = useState<FuncionarioResponse | null>(null);
  const [funcionarios, setFuncionarios] = useState<FuncionarioResponse[]>([]);
  const [funcionariosDesligados, setFuncionariosDesligados] = useState<FuncionarioResponse[]>([]);
  const [organograma, setOrganograma] = useState<OrganogramaNode[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoResponse[]>([]);
  const [cargos, setCargos] = useState<CargoResponse[]>([]);
  const [requisitosDocumentos, setRequisitosDocumentos] = useState<RequisitoDocumentoResponse[]>([]);
  const [solicitacoesRh, setSolicitacoesRh] = useState<SolicitacaoRh[]>([]);
  const [funcionarioSelecionadoId, setFuncionarioSelecionadoId] = useState<number | null>(null);
  const [secaoColaborador, setSecaoColaborador] = useState<SecaoColaborador>('dados');

  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([]);
  const [demonstrativosHolerite, setDemonstrativosHolerite] = useState<DemonstrativoHoleriteResponse[]>([]);
  const [demonstrativosGerais, setDemonstrativosGerais] = useState<DemonstrativoHoleriteResponse[]>([]);
  const [atestados, setAtestados] = useState<AtestadoResponse[]>([]);
  const [beneficios, setBeneficios] = useState<BeneficioResponse[]>([]);
  const [beneficiosAdministrativos, setBeneficiosAdministrativos] = useState<BeneficioAdminResponse[]>([]);
  const [ponto, setPonto] = useState<EspelhoPontoResponse[]>([]);
  const [atestadosAdministrativos, setAtestadosAdministrativos] = useState<AtestadoResponse[]>([]);
  const [pontoAdministrativo, setPontoAdministrativo] = useState<EspelhoPontoResponse[]>([]);
  const [dadosBancariosAlvo, setDadosBancariosAlvo] = useState<DadosBancariosResponse | null>(null);
  const [formacoesAlvo, setFormacoesAlvo] = useState<FormacaoAcademicaResponse[]>([]);
  const [avaliacoesInicio, setAvaliacoesInicio] = useState<AvaliacaoResponse[]>([]);
  const [avaliacoesAlvo, setAvaliacoesAlvo] = useState<AvaliacaoResponse[]>([]);
  const [diretorioFeedback, setDiretorioFeedback] = useState<FuncionarioFeedbackResumo[]>([]);
  const [consentimentos, setConsentimentos] = useState<ConsentimentoResponse[]>([]);
  const [consentimentosAlvo, setConsentimentosAlvo] = useState<ConsentimentoResponse[]>([]);
  const [termoLgpd, setTermoLgpd] = useState<TermoLgpdResponse | null>(null);
  const [historicoAlteracoes, setHistoricoAlteracoes] = useState<HistoricoAlteracaoFuncionarioResponse[]>([]);
  const [muralDocumentos, setMuralDocumentos] = useState<DocumentoResponse[]>([]);
  const [muralHolerites, setMuralHolerites] = useState<HoleriteResponse[]>([]);
  const [muralBeneficios, setMuralBeneficios] = useState<BeneficioResponse[]>([]);
  const [notificacoesSistema, setNotificacoesSistema] = useState<NotificacaoFuncionarioResponse[]>([]);
  const [notificacoesLidas, setNotificacoesLidas] = useState<string[]>([]);
  const [avaliacoesVisualizadas, setAvaliacoesVisualizadas] = useState<number[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [trocaSenhaObrigatoria, setTrocaSenhaObrigatoria] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const funcionarioSelecionadoIdRef = useRef<number | null>(null);

  const isAdmin = me?.perfil === 'ADMIN';
  const isGestor = me?.perfil === 'GESTOR';
  const alvoId = funcionarioSelecionadoId ?? me?.id ?? null;
  const funcionariosConsulta = useMemo(() => {
    const mapa = new Map<number, FuncionarioResponse>();
    [...funcionarios, ...funcionariosDesligados].forEach((funcionario) => {
      mapa.set(funcionario.id, funcionario);
    });
    return Array.from(mapa.values());
  }, [funcionarios, funcionariosDesligados]);
  const alvo = useMemo(
    () => funcionariosConsulta.find((f) => f.id === alvoId) ?? me,
    [alvoId, funcionariosConsulta, me],
  );
  const colaboradorAlvo = useMemo(
    () => funcionariosConsulta.find((funcionario) => funcionario.id === alvoId)
      ?? (isAdmin ? me : null),
    [alvoId, funcionariosConsulta, isAdmin, me],
  );
  const colaboradorAlvoDesligado = colaboradorAlvo?.statusAdmissao === 'DESLIGADO';

  const carregarDadosAlvo = useCallback(
    async (id: number, meuId: number, perfil: Perfil) => {
      const proprio = id === meuId;
      const admin = perfil === 'ADMIN';
      const prefixo = proprio && !admin
        ? '/api/funcionarios/me'
        : `/api/funcionarios/${id}`;
      const gestorConsultandoEquipe = perfil === 'GESTOR' && !proprio;
      const [
        docs,
        hols,
        demonstrativos,
        ates,
        bens,
        pts,
        historico,
        dadosBancarios,
        formacoes,
        consentimentosDoAlvo,
        avaliacoesDoAlvo,
      ] = await Promise.all([
        gestorConsultandoEquipe
          ? Promise.resolve([])
          : buscarLista<DocumentoResponse>(`${prefixo}/documentos`),
        gestorConsultandoEquipe
          ? Promise.resolve([])
          : buscarLista<HoleriteResponse>(`${prefixo}/holerites`),
        gestorConsultandoEquipe
          ? buscarLista<DemonstrativoHoleriteResponse>(`${prefixo}/holerites/demonstrativos`)
          : buscarLista<DemonstrativoHoleriteResponse>(`${prefixo}/holerites/demonstrativos`),
        buscarLista<AtestadoResponse>(`${prefixo}/atestados`),
        gestorConsultandoEquipe
          ? Promise.resolve([])
          : buscarLista<BeneficioResponse>(`${prefixo}/beneficios`),
        buscarLista<EspelhoPontoResponse>(`${prefixo}/espelho-ponto`),
        admin
          ? buscarLista<HistoricoAlteracaoFuncionarioResponse>(`/api/funcionarios/${id}/historico`)
          : Promise.resolve([]),
        admin || proprio
          ? buscarObjetoOpcional<DadosBancariosResponse>(
          proprio
            ? '/api/funcionarios/me/dados-bancarios'
            : `/api/funcionarios/${id}/dados-bancarios`,
          )
          : Promise.resolve(null),
        buscarLista<FormacaoAcademicaResponse>(
          proprio
            ? '/api/funcionarios/me/formacoes'
            : `/api/funcionarios/${id}/formacoes`,
        ),
        admin || perfil === 'GESTOR'
          ? buscarLista<ConsentimentoResponse>(`${prefixo}/consentimento`)
          : Promise.resolve([]),
        perfil === 'GESTOR'
          ? buscarLista<AvaliacaoResponse>(`${prefixo}/avaliacoes`)
          : Promise.resolve([]),
      ]);

      setDocumentos(docs);
      setDemonstrativosHolerite(demonstrativos);
      setAtestados(ates);
      setBeneficios(bens);
      setPonto(pts);
      setHistoricoAlteracoes(historico);
      setDadosBancariosAlvo(dadosBancarios);
      setFormacoesAlvo(formacoes);
      setConsentimentosAlvo(consentimentosDoAlvo);
      setAvaliacoesAlvo(avaliacoesDoAlvo);

      if (id === meuId) {
        setMuralDocumentos(docs);
        setMuralHolerites(hols);
        setMuralBeneficios(bens);
      }
    },
    [],
  );

  const carregar = useCallback(async () => {
    setErro(null);
    setMensagem(null);
    setCarregando(true);
    try {
      const { data: meusDados } = await api.get<FuncionarioResponse>('/api/funcionarios/me');
      setMe(meusDados);
      setTrocaSenhaObrigatoria(await getTrocaSenhaObrigatoria());

      const [
        lista,
        desligados,
        fila,
        arvore,
        docsMural,
        holsMural,
        demonstrativosMural,
        bensMural,
        notificacoesDoSistema,
        meusConsentimentos,
        termoAtual,
        lidas,
        avsInicio,
        visualizadas,
        departamentosAtivos,
        cargosAtivos,
        diretorioFeedbackAtivo,
        beneficiosAdmin,
        requisitosAtivos,
        atestadosPendentes,
        saldosPonto,
      ] = await Promise.all([
        buscarLista<FuncionarioResponse>('/api/funcionarios'),
        meusDados.perfil === 'ADMIN'
          ? buscarLista<FuncionarioResponse>('/api/funcionarios/desligados')
          : Promise.resolve([]),
        meusDados.perfil === 'ADMIN'
          ? buscarLista<FuncionarioResponse>('/api/funcionarios/pendentes')
          : Promise.resolve([]),
        buscarLista<OrganogramaNode>('/api/organograma'),
        meusDados.perfil === 'ADMIN'
          ? Promise.resolve([])
          : buscarLista<DocumentoResponse>('/api/funcionarios/me/documentos'),
        meusDados.perfil === 'ADMIN'
          ? buscarLista<HoleriteResponse>('/api/holerites')
          : buscarLista<HoleriteResponse>('/api/funcionarios/me/holerites'),
        meusDados.perfil === 'FUNCIONARIO'
          ? buscarLista<DemonstrativoHoleriteResponse>('/api/funcionarios/me/holerites/demonstrativos')
          : buscarLista<DemonstrativoHoleriteResponse>('/api/holerites/demonstrativos'),
        meusDados.perfil === 'ADMIN'
          ? Promise.resolve([])
          : buscarLista<BeneficioResponse>('/api/funcionarios/me/beneficios'),
        meusDados.perfil === 'ADMIN'
          ? Promise.resolve([])
          : buscarLista<NotificacaoFuncionarioResponse>('/api/funcionarios/me/notificacoes'),
        meusDados.perfil === 'ADMIN'
          ? Promise.resolve([])
          : buscarLista<ConsentimentoResponse>('/api/funcionarios/me/consentimento'),
        buscarObjeto<TermoLgpdResponse>('/api/termos/lgpd/atual'),
        carregarNotificacoesLidas(meusDados.id),
        meusDados.perfil === 'ADMIN'
          ? Promise.resolve([])
          : buscarLista<AvaliacaoResponse>('/api/funcionarios/me/avaliacoes'),
        carregarAvaliacoesVisualizadas(meusDados.id),
        buscarLista<DepartamentoResponse>('/api/departamentos'),
        buscarLista<CargoResponse>('/api/cargos'),
        meusDados.perfil === 'ADMIN'
          ? Promise.resolve([])
          : buscarLista<FuncionarioFeedbackResumo>('/api/funcionarios/diretorio-feedback'),
        meusDados.perfil === 'ADMIN'
          ? buscarLista<BeneficioAdminResponse>('/api/beneficios')
          : Promise.resolve([]),
        buscarLista<RequisitoDocumentoResponse>('/api/requisitos-documentos'),
        meusDados.perfil === 'ADMIN'
          ? buscarLista<AtestadoResponse>('/api/atestados/pendentes')
          : Promise.resolve([]),
        meusDados.perfil === 'ADMIN'
          ? buscarLista<EspelhoPontoResponse>('/api/espelho-ponto/saldos')
          : Promise.resolve([]),
      ]);

      setFuncionarios(lista.length ? lista : [meusDados]);
      setFuncionariosDesligados(desligados);
      setOrganograma(arvore);
      setDepartamentos(departamentosAtivos.filter((item) => item.ativo));
      setCargos(cargosAtivos.filter((item) => item.ativo));
      setRequisitosDocumentos(requisitosAtivos);
      setDiretorioFeedback(diretorioFeedbackAtivo);
      setBeneficiosAdministrativos(beneficiosAdmin);
      setMuralDocumentos(docsMural);
      setMuralHolerites(holsMural);
      setDemonstrativosGerais(demonstrativosMural);
      setDemonstrativosHolerite(demonstrativosMural);
      setMuralBeneficios(bensMural);
      setNotificacoesSistema(notificacoesDoSistema);
      setConsentimentos(meusConsentimentos);
      setTermoLgpd(termoAtual);
      setNotificacoesLidas(lidas);
      setAvaliacoesInicio(avsInicio);
      setAvaliacoesVisualizadas(visualizadas);
      if (meusDados.perfil === 'ADMIN') {
        setAtestadosAdministrativos(atestadosPendentes);
        setPontoAdministrativo(saldosPonto);
      }
      setSolicitacoesRh(
        meusDados.perfil === 'ADMIN'
          ? await carregarSolicitacoesRh(lista, fila, meusDados.id)
          : [],
      );

      const idInicial = funcionarioSelecionadoIdRef.current
        ?? (meusDados.perfil === 'ADMIN' ? lista[0]?.id : meusDados.id)
        ?? meusDados.id;
      funcionarioSelecionadoIdRef.current = idInicial;
      setFuncionarioSelecionadoId(idInicial);
      await carregarDadosAlvo(idInicial, meusDados.id, meusDados.perfil);
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível carregar os dados da API.'));
    } finally {
      setCarregando(false);
    }
  }, [carregarDadosAlvo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function trocarAlvo(id: number) {
    if (!me) {
      return;
    }
    funcionarioSelecionadoIdRef.current = id;
    setFuncionarioSelecionadoId(id);
    setAtualizando(true);
    setMensagem(null);
    setErro(null);
    try {
      await carregarDadosAlvo(id, me.id, me.perfil);
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível trocar o colaborador.'));
    } finally {
      setAtualizando(false);
    }
  }

  async function abrirAba(id: Aba) {
    if (id === 'colaboradores' && isGestor) {
      const selecionadoEstaNaEquipe = funcionarios.some(
        (funcionario) => funcionario.id === funcionarioSelecionadoId,
      );
      if (!selecionadoEstaNaEquipe) {
        const primeiro = funcionarios[0];
        if (primeiro && me) {
          await trocarAlvo(primeiro.id);
        }
      }
      setSecaoColaborador('dados');
      setAba(id);
      return;
    }
    if (!isAdmin && id !== 'colaboradores' && me && alvoId !== me.id) {
      await trocarAlvo(me.id);
    }
    setAba(id);
  }

  async function dadosPessoaisAtualizados(data: FuncionarioResponse) {
    setMe(data);
    setMensagem('Dados pessoais atualizados.');
    setFuncionarios((atuais) => atuais.map((item) => (item.id === data.id ? data : item)));
    const arvore = await buscarLista<OrganogramaNode>('/api/organograma');
    setOrganograma(arvore);
  }

  async function submeterAdmissao() {
    setAtualizando(true);
    setMensagem(null);
    try {
      const { data } = await api.post<FuncionarioResponse>('/api/funcionarios/me/submeter');
      setMe(data);
      setMensagem('Pré-admissão enviada para avaliação do RH.');
      await carregar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível submeter a pré-admissão.'));
    } finally {
      setAtualizando(false);
    }
  }

  async function registrarConsentimento() {
    setAtualizando(true);
    setMensagem(null);
    try {
      await api.post('/api/funcionarios/me/consentimento');
      const atualizados = await buscarLista<ConsentimentoResponse>(
        '/api/funcionarios/me/consentimento',
      );
      setConsentimentos(atualizados);
      setMensagem('Termo LGPD assinado.');
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível assinar o termo LGPD.'));
    } finally {
      setAtualizando(false);
    }
  }

  async function abrirTermosLgpd() {
    if (!termoLgpd) {
      return;
    }
    try {
      await Linking.openURL(termoLgpd.url);
    } catch {
      setErro('Não foi possível abrir o link dos termos LGPD.');
    }
  }

  async function abrirSistemaPonto() {
    try {
      await Linking.openURL(SISTEMA_PONTO_URL);
    } catch {
      setErro('Não foi possível abrir o sistema externo de ponto.');
    }
  }

  async function aprovarAdmissao(id: number) {
    await executarAcao(`/api/funcionarios/${id}/aprovar`, 'Admissão aprovada.');
  }

  async function reprovarAdmissao(id: number, motivo: string) {
    setAtualizando(true);
    setMensagem(null);
    try {
      await api.post(`/api/funcionarios/${id}/reprovar`, {
        motivo,
      });
      setMensagem('Admissão reprovada para revisão.');
      await carregar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível reprovar a admissão.'));
    } finally {
      setAtualizando(false);
    }
  }

  async function aprovarDocumento(id: number) {
    await executarAcao(`/api/documentos/${id}/aprovar`, 'Documento aprovado.');
  }

  async function reprovarDocumento(id: number, motivo: string) {
    await executarAcao(`/api/documentos/${id}/reprovar`, 'Documento reprovado.', { motivo });
  }

  async function aprovarAtestado(id: number) {
    await executarAcao(`/api/atestados/${id}/aprovar`, 'Atestado aprovado.');
  }

  async function reprovarAtestado(id: number, motivo: string) {
    await executarAcao(`/api/atestados/${id}/reprovar`, 'Atestado reprovado.', { motivo });
  }

  async function removerDocumento(id: number) {
    await executarExclusao(`/api/documentos/${id}`, 'Documento removido.');
  }

  async function removerAtestado(id: number) {
    await executarExclusao(`/api/atestados/${id}`, 'Atestado removido.');
  }

  async function executarAcao(url: string, sucesso: string, body?: object) {
    setAtualizando(true);
    setMensagem(null);
    try {
      await api.post(url, body);
      setMensagem(sucesso);
      await carregar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível concluir a ação.'));
    } finally {
      setAtualizando(false);
    }
  }

  async function executarExclusao(url: string, sucesso: string) {
    setAtualizando(true);
    setErro(null);
    try {
      await api.delete(url);
      setMensagem(sucesso);
      await carregar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível concluir a ação.'));
    } finally {
      setAtualizando(false);
    }
  }

  async function atualizarCadastrosAdministrativos() {
    const [departamentosAtualizados, cargosAtualizados, termoAtual, requisitosAtualizados] = await Promise.all([
      buscarLista<DepartamentoResponse>('/api/departamentos'),
      buscarLista<CargoResponse>('/api/cargos'),
      buscarObjeto<TermoLgpdResponse>('/api/termos/lgpd/atual'),
      buscarLista<RequisitoDocumentoResponse>('/api/requisitos-documentos'),
    ]);
    setDepartamentos(departamentosAtualizados.filter((item) => item.ativo));
    setCargos(cargosAtualizados.filter((item) => item.ativo));
    setTermoLgpd(termoAtual);
    setRequisitosDocumentos(requisitosAtualizados);
  }

  async function atualizarDadosProfissionais(
    id: number,
    request: { perfil: Perfil; departamentoId: number | null; cargoId: number | null; gestorId: number | null },
  ) {
    await api.put(`/api/funcionarios/${id}/profissional`, request);
    await carregar();
    await trocarAlvo(id);
    setMensagem('Informações profissionais atualizadas.');
  }

  async function desligarColaborador(id: number, motivo: string) {
    await api.post(`/api/funcionarios/${id}/desligar`, { motivo });
    setFuncionarioSelecionadoId(null);
    await carregar();
    setMensagem('Colaborador desligado.');
  }

  async function redefinirSenha(id: number, novaSenha: string) {
    await api.put(`/api/funcionarios/${id}/senha`, { novaSenha });
    setMensagem('Senha redefinida.');
  }

  async function sair() {
    abaMemorizada = 'inicio';
    await logout();
    router.replace('/');
  }

  async function senhaTemporariaAlterada(texto: string) {
    await limparTrocaSenhaObrigatoria();
    setTrocaSenhaObrigatoria(false);
    setMensagem(texto);
  }

  async function abrirNotificacao(notificacao: NotificacaoMural) {
    if (!me) {
      return;
    }

    const lidas = Array.from(new Set([...notificacoesLidas, notificacao.id]));
    setNotificacoesLidas(lidas);
    await salvarNotificacoesLidas(me.id, lidas);

    if (notificacao.funcionarioId) {
      await trocarAlvo(notificacao.funcionarioId);
      setSecaoColaborador(notificacao.secaoColaborador ?? 'dados');
    } else if (alvoId !== me.id) {
      await trocarAlvo(me.id);
    }
    setAba(notificacao.aba);
  }

  async function cadastrarColaborador(dados: NovoColaborador) {
    try {
      const { data } = await api.post<FuncionarioResponse>('/api/funcionarios', dados);
      await carregar();
      await trocarAlvo(data.id);
      setSecaoColaborador('dados');
      setMensagem('Colaborador cadastrado. A pré-admissão já pode ser iniciada.');
    } catch (e) {
      throw new Error(mensagemErro(e, 'Não foi possível cadastrar o colaborador.'));
    }
  }

  async function visualizarAvaliacao(id: number) {
    if (!me || avaliacoesVisualizadas.includes(id)) {
      return;
    }
    const visualizadas = [...avaliacoesVisualizadas, id];
    setAvaliacoesVisualizadas(visualizadas);
    await salvarAvaliacoesVisualizadas(me.id, visualizadas);
  }

  async function atualizarGestaoBeneficios() {
    const atualizados = await buscarLista<BeneficioAdminResponse>('/api/beneficios');
    setBeneficiosAdministrativos(atualizados);
    if (me && alvoId) {
      await carregarDadosAlvo(alvoId, me.id, me.perfil);
    }
  }

  async function cadastrarBeneficioEmLote(request: BeneficioLoteRequest) {
    try {
      await api.post('/api/beneficios/lote', request);
      await atualizarGestaoBeneficios();
      setMensagem(`Benefício adicionado para ${request.funcionarioIds.length} colaborador(es).`);
    } catch (e) {
      throw new Error(mensagemErro(e, 'Não foi possível adicionar o benefício.'));
    }
  }

  async function editarBeneficios(ids: number[], request: BeneficioRequest) {
    try {
      await Promise.all(ids.map((id) => api.put(`/api/beneficios/${id}`, request)));
      await atualizarGestaoBeneficios();
      setMensagem('Benefício atualizado.');
    } catch (e) {
      throw new Error(mensagemErro(e, 'Não foi possível atualizar o benefício.'));
    }
  }

  async function removerBeneficios(ids: number[]) {
    try {
      await Promise.all(ids.map((id) => api.delete(`/api/beneficios/${id}`)));
      await atualizarGestaoBeneficios();
      setMensagem('Benefício removido.');
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível remover o benefício.'));
      throw e;
    }
  }

  const navegacao = tabs
    .filter((tab) => tab.id !== 'colaboradores' || isAdmin || isGestor)
    .filter((tab) => tab.id !== 'administracao' || isAdmin)
    .filter((tab) => tab.id !== 'holerites' || isAdmin || isGestor)
    .filter((tab) => tab.id !== 'pessoal' || !isAdmin);

  const notificacoes = (isAdmin
    ? montarNotificacoes([], [], [], [], [], null, solicitacoesRh)
    : montarNotificacoes(
      muralDocumentos,
      muralHolerites,
      muralBeneficios,
      notificacoesSistema,
      consentimentos,
      termoLgpd,
      solicitacoesRh,
    )).filter((notificacao) => !notificacoesLidas.includes(notificacao.id));

  if (carregando && !me) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={color.brand} />
        <Text style={styles.centroTexto}>Carregando seus dados…</Text>
      </View>
    );
  }

  const cabecalho = cabecalhoDaAba(aba, me, isAdmin);

  const lateralInicio = (
    <Inicio
      consentimentos={consentimentos}
      termoLgpd={termoLgpd}
      onAbrirTermos={abrirTermosLgpd}
      onAssinarTermo={registrarConsentimento}
      isAdmin={isAdmin}
      onSenhaAlterada={setMensagem}
    />
  );

  const conteudo = (
    <>
      {aba !== 'inicio' || colunasInicio === 1 ? (
        <View style={styles.paginaCabecalho}>
          <IconeModulo aba={aba} grande={desktopWeb} />
          <View style={styles.paginaTituloBloco}>
            <Text style={[styles.paginaTitulo, desktopWeb && styles.paginaTituloWeb]}>
              {cabecalho.titulo}
            </Text>
            <Text style={styles.paginaDescricao}>{cabecalho.descricao}</Text>
          </View>
          {atualizando ? <Sincronizando /> : null}
        </View>
      ) : null}

      {erro ? <Banner tone="erro" texto={erro} onClose={() => setErro(null)} /> : null}
      {mensagem ? <Banner tone="sucesso" texto={mensagem} onClose={() => setMensagem(null)} /> : null}

      {aba === 'inicio' ? (
        <View style={[styles.inicioGrade, colunasInicio > 1 && styles.inicioGradeLarga]}>
          {colunasInicio > 1 ? (
            <View style={[styles.stack, styles.inicioPerfil]}>
              <PerfilCard me={me} />
              {colunasInicio === 2 ? lateralInicio : null}
            </View>
          ) : null}

          <View style={[styles.stack, colunasInicio > 1 && styles.inicioPrincipal]}>
            {colunasInicio > 1 && atualizando ? <Sincronizando /> : null}
            {me?.statusAdmissao === 'PRE_ADMISSAO' ? (
              <Aviso
                titulo="Conclua sua pré-admissão"
                texto="Preencha seus dados pessoais e bancários e envie todos os documentos obrigatórios. Depois, envie para o RH analisar."
              >
                <ActionButton
                  label={atualizando ? 'Enviando…' : 'Enviar para análise do RH'}
                  onPress={submeterAdmissao}
                  tone="primary"
                  disabled={atualizando}
                />
              </Aviso>
            ) : null}
            {me?.statusAdmissao === 'AGUARDANDO_APROVACAO' ? (
              <Aviso
                titulo="Pré-admissão em análise"
                texto="O RH está conferindo seus dados e documentos. Você será avisado aqui quando houver retorno."
              />
            ) : null}

            <Mural notificacoes={notificacoes} onAbrirNotificacao={abrirNotificacao} />

            {!isAdmin ? (
              <AvaliacoesInicioSection
                avaliacoes={avaliacoesInicio}
                visualizadas={avaliacoesVisualizadas}
                onVisualizar={visualizarAvaliacao}
                funcionarios={diretorioFeedback}
                meuId={me?.id ?? null}
              />
            ) : null}
          </View>

          {colunasInicio === 3 ? (
            <View style={[styles.stack, styles.inicioLateral]}>{lateralInicio}</View>
          ) : null}

          {colunasInicio === 1 ? (
            <View style={styles.stack}>
              <PerfilCard me={me} />
              {lateralInicio}
            </View>
          ) : null}
        </View>
      ) : null}

      {aba === 'pessoal' ? (
        <Colunas
          ativo={barraTopo}
          principal={me ? <PessoalSection me={me} onAtualizado={dadosPessoaisAtualizados} /> : null}
          lateral={(
            <>
              <DadosBancariosSection />
              <FormacaoAcademicaSection />
            </>
          )}
        />
      ) : null}

      {aba === 'arquivos' ? (
        <View style={styles.stack}>
          {isAdmin ? (
            <AdminDocumentosSection
              requisitos={requisitosDocumentos}
              onAtualizar={atualizarCadastrosAdministrativos}
            />
          ) : (
            <DocumentosSection
              funcionarioId={alvoId}
              meuId={me?.id ?? null}
              documentos={documentos}
              requisitos={requisitosDocumentos}
              podeEditar={Boolean(me && alvoId && (alvoId === me.id || isAdmin))}
              isAdmin={isAdmin}
              onAtualizar={async () => {
                if (me && alvoId) {
                  await carregarDadosAlvo(alvoId, me.id, me.perfil);
                }
              }}
              onAprovar={aprovarDocumento}
              onReprovar={reprovarDocumento}
              onRemover={removerDocumento}
            />
          )}
        </View>
      ) : null}

      {aba === 'rh' ? (
        <View style={styles.stack}>
          {isAdmin ? (
            <AdminBeneficiosSection
              funcionarios={funcionarios}
              beneficios={beneficiosAdministrativos}
              onCadastrar={cadastrarBeneficioEmLote}
              onEditar={editarBeneficios}
              onRemover={removerBeneficios}
            />
          ) : (
            <Colunas
              ativo={barraTopo && !isGestor}
              principal={!isGestor ? (
                <HoleritesSection
                  demonstrativos={demonstrativosHolerite}
                  funcionarios={funcionarios}
                  funcionarioId={alvoId}
                  isAdmin={false}
                  modoGeral={false}
                  onAtualizar={async () => {
                    if (me && alvoId) await carregarDadosAlvo(alvoId, me.id, me.perfil);
                  }}
                />
              ) : null}
              lateral={(
                <Section title="Benefícios" subtitle="Benefícios ativos no seu cadastro">
                  <ListaBeneficios beneficios={beneficios} />
                </Section>
              )}
            />
          )}
        </View>
      ) : null}

      {aba === 'holerites' && (isAdmin || isGestor) ? (
        <HoleritesSection
          demonstrativos={demonstrativosGerais}
          funcionarios={funcionarios}
          funcionarioId={alvoId}
          isAdmin={isAdmin}
          modoGeral
          onAtualizar={isAdmin ? carregar : async () => {
            if (me && alvoId) await carregarDadosAlvo(alvoId, me.id, me.perfil);
          }}
        />
      ) : null}

      {aba === 'jornada' ? (
        <View style={styles.stack}>
          {isAdmin ? (
            <AdminJornadaSection
              atestados={atestadosAdministrativos}
              pontos={pontoAdministrativo}
              onAtualizar={carregar}
              onAprovar={aprovarAtestado}
              onReprovar={reprovarAtestado}
              onRemover={removerAtestado}
              onAbrirPonto={abrirSistemaPonto}
            />
          ) : (
            <Colunas
              ativo={barraTopo}
              principal={(
                <AtestadosSection
                  atestados={atestados}
                  podeEnviar={alvoId === me?.id}
                  isAdmin={isAdmin}
                  onAtualizar={async () => {
                    if (me && alvoId) {
                      await carregarDadosAlvo(alvoId, me.id, me.perfil);
                    }
                  }}
                  onAprovar={aprovarAtestado}
                  onReprovar={reprovarAtestado}
                  onRemover={removerAtestado}
                />
              )}
              lateral={(
                <Section title="Banco de horas" subtitle="Saldo consolidado de cada mês">
                  <ListaPonto ponto={ponto} />
                  <LinkButton label="Abrir sistema de ponto" onPress={abrirSistemaPonto} />
                </Section>
              )}
            />
          )}
        </View>
      ) : null}

      {aba === 'colaboradores' && (isAdmin || isGestor) ? (
        <ColaboradoresSection
          funcionarios={funcionarios}
          funcionariosDesligados={funcionariosDesligados}
          departamentos={departamentos}
          cargos={cargos}
          selecionadoId={colaboradorAlvo?.id ?? null}
          secao={secaoColaborador}
          onSelecionar={trocarAlvo}
          onSecaoChange={setSecaoColaborador}
          onCadastrar={cadastrarColaborador}
          podeCadastrar={isAdmin}
          secoesDisponiveis={isAdmin
            ? ['dados', 'documentos', 'beneficios', 'jornada']
            : ['dados', 'avaliacoes', 'jornada']}
          conteudo={{
            dados: (
              <View style={styles.stack}>
                {isAdmin && colaboradorAlvo && !colaboradorAlvoDesligado ? (
                  <GestaoColaboradorActions
                    funcionario={colaboradorAlvo}
                    funcionarios={funcionarios}
                    departamentos={departamentos}
                    cargos={cargos}
                    consentimentos={consentimentosAlvo}
                    onAprovar={aprovarAdmissao}
                    onReprovar={reprovarAdmissao}
                    onAtualizarProfissional={atualizarDadosProfissionais}
                    onDesligar={desligarColaborador}
                    onRedefinirSenha={redefinirSenha}
                  />
                ) : null}
                <DadosColaborador
                  funcionario={colaboradorAlvo}
                  dadosBancarios={dadosBancariosAlvo}
                  formacoes={formacoesAlvo}
                  historico={historicoAlteracoes}
                  mostrarDadosBancarios={isAdmin}
                  mostrarHistorico={isAdmin}
                  podeGerenciarAdmissao={false}
                  onAprovar={aprovarAdmissao}
                  onReprovar={(id) => reprovarAdmissao(id, 'Revisar cadastro.')}
                />
              </View>
            ),
            documentos: (
              <DocumentosSection
                funcionarioId={alvoId}
                meuId={me?.id ?? null}
                documentos={documentos}
                requisitos={requisitosDocumentos}
                podeEditar={isAdmin && !colaboradorAlvoDesligado}
                isAdmin
                onAtualizar={async () => {
                  if (me && alvoId) {
                    await carregarDadosAlvo(alvoId, me.id, me.perfil);
                  }
                }}
                onAprovar={aprovarDocumento}
                onReprovar={reprovarDocumento}
                onRemover={removerDocumento}
              />
            ),
            beneficios: (
              <View style={styles.stack}>
                <Section title="Benefícios" subtitle={alvo?.nome ?? 'Colaborador'}>
                  <ListaBeneficios beneficios={beneficios} />
                </Section>
                <HoleritesSection
                  demonstrativos={demonstrativosHolerite}
                  funcionarios={funcionariosConsulta}
                  funcionarioId={alvoId}
                  isAdmin={isAdmin}
                  modoGeral={false}
                  onAtualizar={async () => {
                    if (me && alvoId) {
                      await carregarDadosAlvo(alvoId, me.id, me.perfil);
                    }
                  }}
                />
              </View>
            ),
            avaliacoes: (
              <HistoricoGestorSection
                avaliacoes={avaliacoesAlvo}
                consentimentos={consentimentosAlvo}
              />
            ),
            jornada: (
              <View style={styles.stack}>
                <AtestadosSection
                  atestados={atestados}
                  podeEnviar={false}
                  isAdmin={isAdmin}
                  onAtualizar={async () => {
                    if (me && alvoId) {
                      await carregarDadosAlvo(alvoId, me.id, me.perfil);
                    }
                  }}
                  onAprovar={aprovarAtestado}
                  onReprovar={reprovarAtestado}
                  onRemover={removerAtestado}
                />
                <Section title="Banco de horas" subtitle="Saldo consolidado de cada mês">
                  <ListaPonto ponto={ponto} />
                  <LinkButton label="Abrir sistema de ponto" onPress={abrirSistemaPonto} />
                </Section>
              </View>
            ),
          }}
        />
      ) : null}

      {aba === 'administracao' && isAdmin ? (
        <AdministracaoSection
          cargos={cargos}
          departamentos={departamentos}
          funcionarios={funcionarios}
          termo={termoLgpd}
          onAtualizar={atualizarCadastrosAdministrativos}
        />
      ) : null}

      {aba === 'org' ? (
        <View style={styles.stack}>
          <OrganogramaSection organograma={organograma} />
        </View>
      ) : null}
    </>
  );

  const rolagem = (
    <ScrollView
      key={aba}
      style={styles.rolagem}
      contentContainerStyle={[
        styles.conteudo,
        barraTopo && styles.conteudoWeb,
        barraTopo && aba === 'arquivos' && styles.conteudoEstreito,
      ]}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={color.brand} />}
    >
      {conteudo}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {barraTopo ? (
        <View style={styles.shellColuna}>
          <Brilho variante="pagina" style={styles.luzPagina} />
          <BarraTopo
            itens={navegacao}
            ativa={aba}
            pendencias={notificacoes.length}
            me={me}
            onNavegar={abrirAba}
            onConta={() => setContaAberta(true)}
          />
          {rolagem}
          <MenuConta
            visivel={contaAberta}
            me={me}
            larguraJanela={width}
            onFechar={() => setContaAberta(false)}
            onSair={sair}
          />
        </View>
      ) : (
        <View style={styles.shellColuna}>
          <Brilho variante="pagina" style={styles.luzPagina} />
          <BarraSuperior me={me} titulo={cabecalho.curto} onConta={() => setContaAberta(true)} />
          {rolagem}
          <NavegacaoInferior
            itens={navegacao}
            ativa={aba}
            pendencias={notificacoes.length}
            onNavegar={abrirAba}
            onMais={() => setMaisAberto(true)}
          />
        </View>
      )}

      <FolhaMenu
        visivel={maisAberto || (contaAberta && !barraTopo)}
        itens={contaAberta ? [] : navegacao.slice(ITENS_BARRA_INFERIOR)}
        ativa={aba}
        me={me}
        onNavegar={(id) => {
          setMaisAberto(false);
          setContaAberta(false);
          abrirAba(id);
        }}
        onFechar={() => {
          setMaisAberto(false);
          setContaAberta(false);
        }}
        onSair={sair}
      />

      <TrocaSenhaObrigatoriaModal
        visible={trocaSenhaObrigatoria}
        onConcluida={senhaTemporariaAlterada}
        onSair={sair}
      />
    </SafeAreaView>
  );
}

async function buscarLista<T>(url: string): Promise<T[]> {
  const { data } = await api.get<T[]>(url);
  if (!Array.isArray(data)) {
    throw new Error(`A API retornou um formato inválido para ${url}.`);
  }
  return data;
}

async function buscarObjeto<T>(url: string): Promise<T> {
  const { data } = await api.get<T>(url);
  return data;
}

async function buscarObjetoOpcional<T>(url: string): Promise<T | null> {
  try {
    return await buscarObjeto<T>(url);
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) {
      return null;
    }
    throw e;
  }
}

function mensagemErro(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    const data = e.response?.data as ApiError | undefined;
    const campos = data?.fields?.map((item) => item.message).filter(Boolean).join(' ');
    if (campos) return campos;
    if (data?.message && data.message !== 'Bad Request') return data.message;
    if (!e.response) {
      return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
    }
    if (e.response.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.';
    }
    if (e.response.status === 403) {
      return 'Seu perfil não possui permissão para acessar estes dados.';
    }
    if (e.response.status >= 500) {
      return `A API apresentou uma falha interna (${e.response.status}). Tente novamente.`;
    }
    return `${fallback} Código HTTP ${e.response.status}.`;
  }
  return e instanceof Error ? e.message : fallback;
}

function primeiroNome(nome?: string | null): string {
  return nome?.trim().split(' ')[0] || 'bem-vindo';
}

function nomeBoasVindas(funcionario?: FuncionarioResponse | null): string {
  if (!funcionario) return 'Usuário';
  const nome = primeiroNome(funcionario.nome);
  if (nome !== 'bem-vindo') return nome;
  if (funcionario.perfil === 'ADMIN') return 'Admin';
  if (funcionario.perfil === 'GESTOR') return 'Gestor';
  return 'Colaborador';
}

function formatarData(valor?: string | null): string {
  if (!valor) {
    return '-';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return valor;
  }
  return data.toLocaleDateString('pt-BR');
}

function formatarDinheiro(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor || 0));
}

function montarNotificacoes(
  documentos: DocumentoResponse[],
  holerites: HoleriteResponse[],
  beneficios: BeneficioResponse[],
  notificacoesSistema: NotificacaoFuncionarioResponse[],
  consentimentos: ConsentimentoResponse[],
  termoLgpd: TermoLgpdResponse | null,
  solicitacoesRh: SolicitacaoRh[],
): NotificacaoMural[] {
  const assinaturaAtual = obterAssinaturaAtual(consentimentos, termoLgpd);
  const notificacoes: NotificacaoMural[] = [
    ...(termoLgpd && !assinaturaAtual
      ? [{
          id: `lgpd-${termoLgpd.versao}-${termoLgpd.url}`,
          titulo: 'Termo LGPD atualizado',
          descricao: 'Leia e assine a nova versão dos termos.',
          criadoEm: termoLgpd.atualizadoEm,
          aba: 'inicio' as const,
        }]
      : []),
    ...documentos
      .filter((documento) => documento.status === 'PENDENTE')
      .map((documento) => ({
        id: `documento-${documento.id}`,
        titulo: 'Documento pendente',
        descricao: `${rotuloDocumento(documento)} aguarda análise.`,
        criadoEm: documento.criadoEm,
        aba: 'arquivos' as const,
      })),
    ...holerites.map((holerite) => ({
      id: `holerite-${holerite.id}`,
      titulo: 'Novo holerite disponível',
      descricao: `Competência ${String(holerite.mes).padStart(2, '0')}/${holerite.ano}.`,
      criadoEm: holerite.criadoEm,
      aba: 'rh' as const,
    })),
    ...beneficios.map((beneficio) => ({
      id: `beneficio-${beneficio.id}`,
      titulo: 'Novo benefício',
      descricao: rotuloBeneficio(beneficio.tipo),
      criadoEm: beneficio.criadoEm,
      aba: 'rh' as const,
    })),
    ...notificacoesSistema.map((notificacao) => ({
      id: `sistema-${notificacao.id}`,
      titulo: notificacao.titulo,
      descricao: notificacao.descricao,
      criadoEm: notificacao.criadoEm,
      aba: normalizarAbaNotificacao(notificacao.aba),
    })),
    ...solicitacoesRh.map((solicitacao) => ({
      id: solicitacao.id,
      titulo: solicitacao.titulo,
      descricao: `${solicitacao.funcionarioNome}: ${solicitacao.descricao}`,
      criadoEm: solicitacao.criadoEm,
      aba: 'colaboradores' as const,
      funcionarioId: solicitacao.funcionarioId,
      secaoColaborador: solicitacao.secao,
    })),
  ];

  return notificacoes.sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  );
}

function normalizarAbaNotificacao(aba: string): Aba {
  return tabs.some((tab) => tab.id === aba) ? (aba as Aba) : 'inicio';
}

async function carregarSolicitacoesRh(
  funcionarios: FuncionarioResponse[],
  pendentes: FuncionarioResponse[],
  meuId: number,
): Promise<SolicitacaoRh[]> {
  const colaboradores = funcionarios.filter((funcionario) => funcionario.id !== meuId);
  const resultados = await Promise.all(
    colaboradores.map(async (funcionario) => {
      const [documentos, atestados] = await Promise.all([
        buscarLista<DocumentoResponse>(`/api/funcionarios/${funcionario.id}/documentos`),
        buscarLista<AtestadoResponse>(`/api/funcionarios/${funcionario.id}/atestados`),
      ]);
      return [
        ...documentos
          .filter((documento) => documento.status === 'PENDENTE')
          .map((documento): SolicitacaoRh => ({
            id: `rh-documento-${documento.id}`,
            funcionarioId: funcionario.id,
            funcionarioNome: funcionario.nome,
            titulo: 'Novo documento para análise',
            descricao: rotuloDocumento(documento),
            criadoEm: documento.criadoEm,
            secao: 'documentos',
          })),
        ...atestados
          .filter((atestado) => atestado.status === 'PENDENTE')
          .map((atestado): SolicitacaoRh => ({
            id: `rh-atestado-${atestado.id}`,
            funcionarioId: funcionario.id,
            funcionarioNome: funcionario.nome,
            titulo: 'Novo atestado para análise',
            descricao: `${formatarData(atestado.dataInicio)} até ${formatarData(atestado.dataFim)}`,
            criadoEm: atestado.criadoEm,
            secao: 'jornada',
          })),
      ];
    }),
  );

  const admissoes = pendentes.map((funcionario): SolicitacaoRh => ({
    id: `rh-admissao-${funcionario.id}-${funcionario.atualizadoEm}`,
    funcionarioId: funcionario.id,
    funcionarioNome: funcionario.nome,
    titulo: 'Pré-admissão aguardando análise',
    descricao: 'Cadastro finalizado pelo colaborador.',
    criadoEm: funcionario.atualizadoEm,
    secao: 'dados',
  }));

  return [...resultados.flat(), ...admissoes].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  );
}

async function carregarNotificacoesLidas(funcionarioId: number): Promise<string[]> {
  const chave = `${NOTIFICACOES_LIDAS_KEY}_${funcionarioId}`;
  const valor =
    Platform.OS === 'web'
      ? window.localStorage.getItem(chave)
      : await SecureStore.getItemAsync(chave);

  if (!valor) {
    return [];
  }

  try {
    const itens = JSON.parse(valor);
    return Array.isArray(itens) ? itens.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

async function salvarNotificacoesLidas(funcionarioId: number, ids: string[]): Promise<void> {
  const chave = `${NOTIFICACOES_LIDAS_KEY}_${funcionarioId}`;
  const valor = JSON.stringify(ids);

  if (Platform.OS === 'web') {
    window.localStorage.setItem(chave, valor);
    return;
  }

  await SecureStore.setItemAsync(chave, valor);
}

async function carregarAvaliacoesVisualizadas(funcionarioId: number): Promise<number[]> {
  const chave = `${AVALIACOES_VISUALIZADAS_KEY}_${funcionarioId}`;
  const valor =
    Platform.OS === 'web'
      ? window.localStorage.getItem(chave)
      : await SecureStore.getItemAsync(chave);

  if (!valor) {
    return [];
  }

  try {
    const itens = JSON.parse(valor);
    return Array.isArray(itens)
      ? itens.filter((item) => typeof item === 'number')
      : [];
  } catch {
    return [];
  }
}

async function salvarAvaliacoesVisualizadas(
  funcionarioId: number,
  ids: number[],
): Promise<void> {
  const chave = `${AVALIACOES_VISUALIZADAS_KEY}_${funcionarioId}`;
  const valor = JSON.stringify(ids);

  if (Platform.OS === 'web') {
    window.localStorage.setItem(chave, valor);
    return;
  }

  await SecureStore.setItemAsync(chave, valor);
}

function cabecalhoDaAba(
  aba: Aba,
  me: FuncionarioResponse | null,
  isAdmin: boolean,
): { titulo: string; curto: string; descricao: string } {
  switch (aba) {
    case 'inicio':
      return { titulo: `Olá, ${nomeBoasVindas(me)}`, curto: 'Início', descricao: dataPorExtenso() };
    case 'pessoal':
      return { titulo: 'Meus dados', curto: 'Meus dados', descricao: 'Informações pessoais, dados bancários e formação acadêmica.' };
    case 'arquivos':
      return {
        titulo: 'Documentos',
        curto: 'Documentos',
        descricao: isAdmin
          ? 'Defina quais documentos os colaboradores precisam enviar.'
          : 'Envie seus documentos e acompanhe a análise do RH.',
      };
    case 'rh':
      if (isAdmin) {
        return { titulo: 'Benefícios', curto: 'Benefícios', descricao: 'Benefícios oferecidos e quem recebe cada um.' };
      }
      if (me?.perfil === 'GESTOR') {
        return { titulo: 'Benefícios', curto: 'Benefícios', descricao: 'Seus benefícios ativos.' };
      }
      return { titulo: 'Benefícios e salário', curto: 'Benefícios', descricao: 'Seus benefícios ativos e holerites.' };
    case 'holerites':
      return {
        titulo: 'Holerites da equipe',
        curto: 'Holerites',
        descricao: isAdmin
          ? 'Publique holerites e consulte os valores de cada colaborador.'
          : 'Consulte os holerites das pessoas da sua equipe.',
      };
    case 'jornada':
      return {
        titulo: 'Jornada',
        curto: 'Jornada',
        descricao: isAdmin
          ? 'Atestados para análise e saldos de ponto da empresa.'
          : 'Atestados médicos e banco de horas.',
      };
    case 'colaboradores':
      return {
        titulo: 'Colaboradores',
        curto: 'Colaboradores',
        descricao: isAdmin
          ? 'Cadastro, admissão e dados de cada pessoa.'
          : 'Acompanhe as pessoas da sua equipe.',
      };
    case 'administracao':
      return { titulo: 'Administração', curto: 'Administração', descricao: 'Cargos, departamentos e termo LGPD.' };
    case 'org':
      return { titulo: 'Organograma', curto: 'Organograma', descricao: 'Estrutura de liderança da empresa.' };
  }
}

function dataPorExtenso(): string {
  const texto = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function iniciais(nome?: string | null): string {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  const primeira = partes[0].charAt(0);
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return (primeira + ultima).toUpperCase();
}

const ICONES_MENU: Record<Aba, typeof Home> = {
  inicio: Home,
  pessoal: UserRound,
  arquivos: FileText,
  rh: Wallet,
  holerites: ReceiptText,
  jornada: Clock3,
  colaboradores: UsersRound,
  administracao: Settings,
  org: Network,
};

/** Cada módulo tem um tom próprio, repetido no cabeçalho da página e nas notificações. */
const TOM_MODULO: Record<Aba, NomeTom> = {
  inicio: 'verde',
  pessoal: 'indigo',
  arquivos: 'azul',
  rh: 'violeta',
  holerites: 'laranja',
  jornada: 'teal',
  colaboradores: 'rosa',
  administracao: 'ardosia',
  org: 'ciano',
};

function IconeModulo({ aba, grande = false, pequeno = false }: { aba: Aba; grande?: boolean; pequeno?: boolean }) {
  const Icone = ICONES_MENU[aba];
  const tom = tons[TOM_MODULO[aba]];
  const tamanho = grande ? 52 : pequeno ? 36 : 44;
  // Ladrilho cheio com ícone branco: destaca tanto no fundo claro quanto no escuro,
  // e a sombra na cor do próprio módulo dá a sensação de luz.
  return (
    <View
      style={[
        styles.moduloIcone,
        { width: tamanho, height: tamanho, backgroundColor: tom.solido, shadowColor: tom.solido },
      ]}
      importantForAccessibility="no-hide-descendants"
    >
      <Icone color="#FFFFFF" size={grande ? 24 : pequeno ? 18 : 21} strokeWidth={2.1} />
    </View>
  );
}

function Avatar({ nome, tamanho = 36 }: { nome?: string | null; tamanho?: number }) {
  const tom = tomDoNome(nome);
  return (
    <View style={[styles.avatar, { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: tom.suave }]}>
      <Text style={[styles.avatarTexto, { color: tom.texto }, tamanho >= 64 && type.heading]}>
        {iniciais(nome)}
      </Text>
    </View>
  );
}

const ITENS_BARRA_INFERIOR = 4;

type ItemNavegacao = (typeof tabs)[number];

const LARGURA_CONTEUDO = 1240;

function BarraTopo({
  itens,
  ativa,
  pendencias,
  me,
  onNavegar,
  onConta,
}: {
  itens: ItemNavegacao[];
  ativa: Aba;
  pendencias: number;
  me: FuncionarioResponse | null;
  onNavegar: (id: Aba) => void;
  onConta: () => void;
}) {
  const { width } = useWindowDimensions();
  // Com muitos itens (perfil de RH), o nome da marca sai em telas médias para o menu caber.
  const mostrarNome = width >= 1200 || itens.length <= 6;
  return (
    <View style={styles.topo}>
      <View style={styles.topoInterno}>
        <View style={styles.topoMarca}>
          <AlternarTema />
          <View style={styles.barraSelo}>
            <Image
              source={require('../../assets/images/logo-conformia.png')}
              style={styles.barraLogo}
              resizeMode="contain"
            />
          </View>
          {mostrarNome ? <Text style={styles.topoMarcaNome}>Conformia</Text> : null}
        </View>

        <View style={styles.topoNav} role="navigation">
          <View style={styles.topoTrilho}>
          {itens.map((item) => {
            const ativo = item.id === ativa;
            return (
              <Pressable
                key={item.id}
                onPress={() => onNavegar(item.id)}
                accessibilityRole="link"
                accessibilityState={{ selected: ativo }}
                style={(estado) => [
                  styles.topoItem,
                  (estado as { hovered?: boolean }).hovered && !ativo && styles.topoItemHover,
                  ativo && styles.topoItemAtivo,
                ]}
              >
                <Text style={[styles.topoItemTexto, ativo && styles.topoItemTextoAtivo]} numberOfLines={1}>
                  {item.topo}
                </Text>
                {item.id === 'inicio' && pendencias > 0 ? <Contador valor={pendencias} /> : null}
              </Pressable>
            );
          })}
          </View>
        </View>

        <Pressable
          onPress={onConta}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu da conta"
          style={(estado) => [
            styles.topoConta,
            (estado as { hovered?: boolean }).hovered && styles.topoItemHover,
          ]}
        >
          <Avatar nome={me?.nome} />
          <ChevronDown color={color.onHeaderMuted} size={16} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

function MenuConta({
  visivel,
  me,
  larguraJanela,
  onFechar,
  onSair,
}: {
  visivel: boolean;
  me: FuncionarioResponse | null;
  larguraJanela: number;
  onFechar: () => void;
  onSair: () => void;
}) {
  // Alinha o menu à borda direita do conteúdo centralizado.
  const direita = Math.max((larguraJanela - LARGURA_CONTEUDO) / 2, 0) + 32;
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.menuContaFundo} onPress={onFechar} accessibilityLabel="Fechar menu da conta" />
      <View style={[styles.menuConta, { right: direita }]}>
        <View style={styles.menuContaCabecalho}>
          <Text style={styles.folhaNome} numberOfLines={1}>{me?.nome ?? 'Usuário'}</Text>
          <Text style={styles.folhaPerfil} numberOfLines={1}>{me ? labelsPerfilLongo[me.perfil] : ''}</Text>
          <Text style={styles.folhaPerfil} numberOfLines={1}>{me?.email ?? ''}</Text>
        </View>
        <Pressable
          onPress={onSair}
          style={(estado) => [
            styles.folhaItem,
            ((estado as { hovered?: boolean }).hovered || estado.pressed) && styles.folhaItemAtivo,
          ]}
          accessibilityRole="button"
        >
          <LogOut color={color.danger} size={18} strokeWidth={1.9} />
          <Text style={[styles.folhaItemTexto, styles.folhaSairTexto]}>Sair da conta</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function PerfilCard({ me }: { me: FuncionarioResponse | null }) {
  const linhas: { Icone: typeof Home; texto: string; rotulo: string }[] = [
    { Icone: BriefcaseBusiness, texto: me?.cargoNome ?? 'Cargo não informado', rotulo: 'Cargo' },
    { Icone: Network, texto: me?.departamentoNome ?? 'Sem departamento', rotulo: 'Departamento' },
    { Icone: UserRound, texto: me?.gestorNome ? `Líder: ${me.gestorNome}` : 'Sem líder direto', rotulo: 'Líder direto' },
    { Icone: Mail, texto: me?.email ?? '-', rotulo: 'E-mail' },
    {
      Icone: CalendarDays,
      texto: me?.dataAdmissao ? `Desde ${formatarData(me.dataAdmissao)}` : 'Admissão não informada',
      rotulo: 'Data de admissão',
    },
  ];
  return (
    <View style={styles.perfilCard}>
      <View style={styles.perfilTopo}>
        <View style={styles.perfilFaixa} importantForAccessibility="no-hide-descendants">
          <Brilho variante="claro" />
        </View>
        <View style={styles.perfilAvatarAnel}>
          <Avatar nome={me?.nome} tamanho={84} />
        </View>
        {me ? (
          <View style={styles.perfilPapel}>
            <Text style={styles.perfilPapelTexto}>{labelsPerfilLongo[me.perfil]}</Text>
          </View>
        ) : null}
        <Text style={styles.perfilNome}>{me?.nome ?? 'Usuário'}</Text>
        <Text style={styles.perfilData}>{dataPorExtenso()}</Text>
      </View>
      <View style={styles.perfilLista}>
        {linhas.map(({ Icone, texto, rotulo }) => (
          <View key={rotulo} style={styles.perfilLinha} accessibilityLabel={`${rotulo}: ${texto}`}>
            <Icone color={color.brand} size={17} strokeWidth={1.9} />
            <Text style={styles.perfilLinhaTexto} numberOfLines={1}>{texto}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Sincronizando() {
  return (
    <View style={styles.sincronizando} accessibilityLiveRegion="polite">
      <ActivityIndicator size="small" color={color.brand} />
      <Text style={styles.sincronizandoTexto}>Atualizando</Text>
    </View>
  );
}

function Contador({ valor, invertido = false }: { valor: number; invertido?: boolean }) {
  return (
    <View style={[styles.contador, invertido && styles.contadorInvertido]}>
      <Text style={[styles.contadorTexto, invertido && styles.contadorTextoInvertido]}>
        {valor > 99 ? '99+' : valor}
      </Text>
    </View>
  );
}

function BarraSuperior({
  me,
  titulo,
  onConta,
}: {
  me: FuncionarioResponse | null;
  titulo: string;
  onConta: () => void;
}) {
  return (
    <View style={styles.barraSuperior}>
      <View style={styles.barraMarca}>
        <AlternarTema />
        <View style={styles.barraSelo}>
          <Image
            source={require('../../assets/images/logo-conformia.png')}
            style={styles.barraLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.barraTitulo} numberOfLines={1}>{titulo}</Text>
      </View>
      <Pressable
        onPress={onConta}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu da conta"
        hitSlop={6}
      >
        <Avatar nome={me?.nome} />
      </Pressable>
    </View>
  );
}

function NavegacaoInferior({
  itens,
  ativa,
  pendencias,
  onNavegar,
  onMais,
}: {
  itens: ItemNavegacao[];
  ativa: Aba;
  pendencias: number;
  onNavegar: (id: Aba) => void;
  onMais: () => void;
}) {
  const precisaMais = itens.length > ITENS_BARRA_INFERIOR + 1;
  const visiveis = precisaMais ? itens.slice(0, ITENS_BARRA_INFERIOR) : itens;
  const maisAtivo = precisaMais && !visiveis.some((item) => item.id === ativa);

  return (
    <View style={styles.barraInferior} accessibilityRole="tablist">
      {visiveis.map((item) => {
        const Icone = ICONES_MENU[item.id];
        const ativo = item.id === ativa;
        return (
          <Pressable
            key={item.id}
            onPress={() => onNavegar(item.id)}
            style={styles.barraInferiorItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={item.label}
          >
            <View style={[styles.barraInferiorIcone, ativo && styles.barraInferiorIconeAtivo]}>
              <Icone color={ativo ? color.brandStrong : color.muted} size={22} strokeWidth={ativo ? 2.2 : 1.8} />
              {item.id === 'inicio' && pendencias > 0 ? <View style={styles.pontoAviso} /> : null}
            </View>
            <Text
              style={[styles.barraInferiorTexto, ativo && styles.barraInferiorTextoAtivo]}
              numberOfLines={1}
            >
              {item.curto}
            </Text>
          </Pressable>
        );
      })}
      {precisaMais ? (
        <Pressable
          onPress={onMais}
          style={styles.barraInferiorItem}
          accessibilityRole="tab"
          accessibilityState={{ selected: maisAtivo }}
          accessibilityLabel="Mais opções"
        >
          <View style={[styles.barraInferiorIcone, maisAtivo && styles.barraInferiorIconeAtivo]}>
            <Menu color={maisAtivo ? color.brandStrong : color.muted} size={22} strokeWidth={maisAtivo ? 2.2 : 1.8} />
          </View>
          <Text style={[styles.barraInferiorTexto, maisAtivo && styles.barraInferiorTextoAtivo]}>
            Mais
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FolhaMenu({
  visivel,
  itens,
  ativa,
  me,
  onNavegar,
  onFechar,
  onSair,
}: {
  visivel: boolean;
  itens: ItemNavegacao[];
  ativa: Aba;
  me: FuncionarioResponse | null;
  onNavegar: (id: Aba) => void;
  onFechar: () => void;
  onSair: () => void;
}) {
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <Pressable style={styles.folhaFundo} onPress={onFechar} accessibilityLabel="Fechar menu" />
      <View style={styles.folha}>
        <View style={styles.folhaAlca} />
        <View style={styles.folhaConta}>
          <Avatar nome={me?.nome} />
          <View style={styles.flex1}>
            <Text style={styles.folhaNome} numberOfLines={1}>{me?.nome ?? 'Usuário'}</Text>
            <Text style={styles.folhaPerfil} numberOfLines={1}>
              {me ? `${labelsPerfilLongo[me.perfil]}, ${me.email}` : ''}
            </Text>
          </View>
        </View>
        {itens.map((item) => {
          const Icone = ICONES_MENU[item.id];
          const ativo = item.id === ativa;
          return (
            <Pressable
              key={item.id}
              onPress={() => onNavegar(item.id)}
              style={({ pressed }) => [styles.folhaItem, (pressed || ativo) && styles.folhaItemAtivo]}
              accessibilityRole="link"
              accessibilityState={{ selected: ativo }}
            >
              <Icone color={ativo ? color.brand : color.inkSoft} size={20} strokeWidth={1.9} />
              <Text style={[styles.folhaItemTexto, ativo && styles.folhaItemTextoAtivo]}>{item.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={onSair}
          style={({ pressed }) => [styles.folhaItem, pressed && styles.folhaItemAtivo]}
          accessibilityRole="button"
        >
          <LogOut color={color.danger} size={20} strokeWidth={1.9} />
          <Text style={[styles.folhaItemTexto, styles.folhaSairTexto]}>Sair da conta</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function Mural({
  notificacoes,
  onAbrirNotificacao,
}: {
  notificacoes: NotificacaoMural[];
  onAbrirNotificacao: (notificacao: NotificacaoMural) => void;
}) {
  return (
    <Section
      title="Pendências e novidades"
      subtitle={notificacoes.length
        ? `${notificacoes.length} ${notificacoes.length === 1 ? 'item precisa' : 'itens precisam'} da sua atenção`
        : undefined}
    >
      {notificacoes.length ? (
        <View>
          {notificacoes.map((notificacao, indice) => (
            <Pressable
              key={notificacao.id}
              style={(estado) => [
                styles.notificacao,
                indice === 0 && styles.semDivisor,
                ((estado as { hovered?: boolean }).hovered || estado.pressed) && styles.notificacaoHover,
              ]}
              onPress={() => onAbrirNotificacao(notificacao)}
              accessibilityRole="button"
              accessibilityLabel={`${notificacao.titulo}. ${notificacao.descricao}`}
            >
              <IconeModulo aba={notificacao.aba} pequeno />
              <View style={styles.notificacaoConteudo}>
                <Text style={styles.notificacaoTitulo}>{notificacao.titulo}</Text>
                <Text style={styles.notificacaoDescricao} numberOfLines={2}>{notificacao.descricao}</Text>
              </View>
              <Text style={styles.notificacaoData}>{formatarData(notificacao.criadoEm)}</Text>
              <ChevronRight color={color.placeholder} size={18} strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Empty text="Tudo em dia. Novos documentos, holerites e avisos aparecem aqui." />
      )}
    </Section>
  );
}

function Inicio({
  consentimentos,
  termoLgpd,
  onAbrirTermos,
  onAssinarTermo,
  isAdmin,
  onSenhaAlterada,
}: {
  consentimentos: ConsentimentoResponse[];
  termoLgpd: TermoLgpdResponse | null;
  onAbrirTermos: () => void;
  onAssinarTermo: () => void;
  isAdmin: boolean;
  onSenhaAlterada: (texto: string) => void;
}) {
  return (
    <>
      {!isAdmin ? (
        <LgpdSection
          consentimentos={consentimentos}
          termo={termoLgpd}
          onAbrirTermos={onAbrirTermos}
          onAssinar={onAssinarTermo}
        />
      ) : null}
      <SenhaSection onSucesso={onSenhaAlterada} />
    </>
  );
}

/** Coluna principal + coluna lateral no desktop; empilhadas no celular. */
function Colunas({
  ativo,
  principal,
  lateral,
}: {
  ativo: boolean;
  principal: ReactNode;
  lateral?: ReactNode;
}) {
  if (!ativo || !lateral) {
    return (
      <View style={styles.stack}>
        {principal}
        {lateral}
      </View>
    );
  }
  return (
    <View style={styles.colunas}>
      <View style={[styles.stack, styles.colunaPrincipal]}>{principal}</View>
      <View style={[styles.stack, styles.colunaLateral]}>{lateral}</View>
    </View>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.flex1}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      <View>{children}</View>
    </View>
  );
}

function Aviso({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.aviso}>
      <Text style={styles.avisoTitulo}>{titulo}</Text>
      <Text style={styles.avisoTexto}>{texto}</Text>
      {children}
    </View>
  );
}

function InfoLine({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  return (
    <View style={[styles.infoLine, first && styles.semDivisor]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DadosColaborador({
  funcionario,
  dadosBancarios,
  formacoes,
  historico,
  mostrarDadosBancarios,
  mostrarHistorico,
  podeGerenciarAdmissao,
  onAprovar,
  onReprovar,
}: {
  funcionario: FuncionarioResponse | null;
  dadosBancarios: DadosBancariosResponse | null;
  formacoes: FormacaoAcademicaResponse[];
  historico: HistoricoAlteracaoFuncionarioResponse[];
  mostrarDadosBancarios: boolean;
  mostrarHistorico: boolean;
  podeGerenciarAdmissao: boolean;
  onAprovar: (id: number) => void;
  onReprovar: (id: number) => void;
}) {
  if (!funcionario) {
    return <Section title="Dados" subtitle="Colaborador selecionado"><Empty text="Selecione um colaborador." /></Section>;
  }

  return (
    <View style={styles.stack}>
      <Section title="Informações profissionais" subtitle="Vínculo e estrutura organizacional">
        <InfoLine label="E-mail profissional" value={funcionario.email} first />
        <InfoLine label="Perfil" value={labelsPerfil[funcionario.perfil]} />
        <InfoLine label="Situação" value={labelsAdmissao[funcionario.statusAdmissao]} />
        <InfoLine label="Cargo" value={funcionario.cargoNome ?? 'Não informado'} />
        <InfoLine label="Departamento" value={funcionario.departamentoNome ?? 'Não informado'} />
        <InfoLine label="Líder direto" value={funcionario.gestorNome ?? 'Não informado'} />
        <InfoLine
          label="Admissão"
          value={funcionario.dataAdmissao ? formatarData(funcionario.dataAdmissao) : 'Não informado'}
        />
        {podeGerenciarAdmissao && funcionario.statusAdmissao === 'AGUARDANDO_APROVACAO' ? (
          <View style={styles.botoesLinha}>
            <ActionButton label="Aprovar admissão" onPress={() => onAprovar(funcionario.id)} tone="primary" />
            <ActionButton label="Solicitar revisão" onPress={() => onReprovar(funcionario.id)} tone="danger" />
          </View>
        ) : null}
      </Section>

      <Section title="Dados pessoais" subtitle="Cadastro pessoal completo">
        <InfoLine label="Nome completo" value={funcionario.nome} first />
        <InfoLine label="CPF" value={formatarCpf(funcionario.cpf)} />
        <InfoLine label="Telefone" value={funcionario.telefone ?? 'Não informado'} />
        <InfoLine
          label="Nacionalidade(s)"
          value={funcionario.nacionalidades.length
            ? funcionario.nacionalidades.join(', ')
            : 'Não informado'}
        />
        <InfoLine label="UF natal" value={funcionario.ufNatal ?? 'Não informado'} />
        <InfoLine label="Cidade natal" value={funcionario.cidadeNatal ?? 'Não informado'} />
        <InfoLine label="Gênero" value={rotuloGenero(funcionario.genero)} />
        <InfoLine label="Nome social" value={funcionario.nomeSocial ?? 'Não informado'} />
        <InfoLine label="Estado civil" value={rotuloEstadoCivil(funcionario.estadoCivil)} />
        <InfoLine
          label="Data de nascimento"
          value={funcionario.dataNascimento ? formatarData(funcionario.dataNascimento) : 'Não informado'}
        />
      </Section>

      {mostrarDadosBancarios ? (
        <Section title="Dados bancários" subtitle="Conta cadastrada para recebimentos">
          <InfoLine label="Banco" value={dadosBancarios?.banco ?? 'Não informado'} first />
          <InfoLine
            label="Tipo de conta"
            value={rotuloTipoConta(dadosBancarios?.tipoConta ?? null)}
          />
          <InfoLine label="Agência" value={dadosBancarios?.agencia ?? 'Não informado'} />
          <InfoLine label="Conta" value={dadosBancarios?.conta ?? 'Não informado'} />
          <InfoLine label="Chave Pix" value={dadosBancarios?.chavePix ?? 'Não informado'} />
        </Section>
      ) : null}

      <Section title="Formação acadêmica" subtitle="Escolaridade e cursos informados">
        {formacoes.length ? (
          <View style={styles.stackInterno}>
            {formacoes.map((formacao) => (
              <ListItem
                key={formacao.id}
                title={formacao.curso}
                subtitle={`${formacao.instituicaoEnsino} · ${formacao.anoConclusao}`}
                right={<Text style={styles.formacaoNivel}>
                  {rotuloEscolaridade(formacao.escolaridade)}
                </Text>}
              />
            ))}
          </View>
        ) : (
          <Empty text="Nenhuma formação acadêmica cadastrada." />
        )}
      </Section>
      {mostrarHistorico ? (
        <Section title="Histórico de modificações" subtitle="Alterações registradas pelo RH">
          <ListaHistoricoAlteracoes historico={historico} />
        </Section>
      ) : null}
    </View>
  );
}

function formatarCpf(valor: string): string {
  return valor.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    '$1.$2.$3-$4',
  );
}

function SenhaSection({ onSucesso }: { onSucesso: (texto: string) => void }) {
  const [aberto, setAberto] = useState(false);
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [erroSenha, setErroSenha] = useState<string | null>(null);

  async function alterar() {
    if (!atual || nova.length < 6) {
      setErroSenha('Informe a senha atual e uma nova senha de pelo menos 6 caracteres.');
      return;
    }
    try {
      await api.put('/api/funcionarios/me/senha', { senhaAtual: atual, novaSenha: nova });
      setAberto(false);
      setAtual('');
      setNova('');
      setErroSenha(null);
      onSucesso('Senha alterada.');
    } catch (e) {
      setErroSenha(mensagemErro(e, 'Não foi possível alterar a senha.'));
    }
  }

  return (
      <Section title="Senha" subtitle="A senha que você usa para entrar no Conformia">
      <ActionButton label="Alterar senha" onPress={() => setAberto(true)} tone="ghost" />
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={senhaStyles.overlay}>
          <View style={senhaStyles.modal}>
            <Text style={senhaStyles.title}>Alterar senha</Text>
            {erroSenha ? <Text style={senhaStyles.error}>{erroSenha}</Text> : null}
            <TextInput style={senhaStyles.input} value={atual} onChangeText={setAtual}
              secureTextEntry placeholder="Senha atual" placeholderTextColor={color.placeholder} />
            <TextInput style={senhaStyles.input} value={nova} onChangeText={setNova}
              secureTextEntry placeholder="Nova senha, mínimo de 6 caracteres" placeholderTextColor={color.placeholder} />
            <View style={senhaStyles.actions}>
              <ActionButton label="Cancelar" onPress={() => setAberto(false)} tone="ghost" />
              <ActionButton label="Alterar" onPress={alterar} tone="primary" />
            </View>
          </View>
        </View>
      </Modal>
    </Section>
  );
}

function TrocaSenhaObrigatoriaModal({
  visible,
  onConcluida,
  onSair,
}: {
  visible: boolean;
  onConcluida: (texto: string) => void;
  onSair: () => void;
}) {
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);

  async function salvar() {
    if (nova.length < 6) {
      setErroSenha('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (nova !== confirmacao) {
      setErroSenha('As senhas informadas não conferem.');
      return;
    }

    setSalvando(true);
    setErroSenha(null);
    try {
      await api.put('/api/funcionarios/me/senha-temporaria', { novaSenha: nova });
      setNova('');
      setConfirmacao('');
      onConcluida('Senha atualizada. Use sua nova senha nos próximos acessos.');
    } catch (e) {
      setErroSenha(mensagemErro(e, 'Não foi possível atualizar a senha.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => null}>
      <View style={senhaStyles.overlay}>
        <View style={senhaStyles.modal}>
          <Text style={senhaStyles.title}>Crie uma nova senha</Text>
          <Text style={senhaStyles.description}>
            Sua conta foi criada com uma senha temporária. Para continuar usando a plataforma,
            defina uma senha própria e segura.
          </Text>
          {erroSenha ? <Text style={senhaStyles.error}>{erroSenha}</Text> : null}
          <TextInput
            style={senhaStyles.input}
            value={nova}
            onChangeText={setNova}
            secureTextEntry
            placeholder="Nova senha"
            placeholderTextColor={color.placeholder}
          />
          <TextInput
            style={senhaStyles.input}
            value={confirmacao}
            onChangeText={setConfirmacao}
            secureTextEntry
            placeholder="Confirmar nova senha"
            placeholderTextColor={color.placeholder}
            onSubmitEditing={salvar}
          />
          <View style={senhaStyles.actions}>
            <ActionButton label="Sair" onPress={onSair} tone="ghost" />
            <ActionButton
              label={salvando ? 'Salvando...' : 'Salvar senha'}
              onPress={salvar}
              tone="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}


function rotuloGenero(valor: FuncionarioResponse['genero']): string {
  if (valor === 'HOMEM') return 'Homem';
  if (valor === 'MULHER') return 'Mulher';
  if (valor === 'OUTRO') return 'Outro';
  return 'Não informado';
}

function rotuloEstadoCivil(valor: FuncionarioResponse['estadoCivil']): string {
  const rotulos = {
    SOLTEIRO: 'Solteiro(a)',
    CASADO: 'Casado(a)',
    UNIAO_ESTAVEL: 'União estável',
    SEPARADO: 'Separado(a)',
    DIVORCIADO: 'Divorciado(a)',
    VIUVO: 'Viúvo(a)',
  };
  return valor ? rotulos[valor] : 'Não informado';
}

function rotuloTipoConta(valor: DadosBancariosResponse['tipoConta']): string {
  const rotulos = {
    CORRENTE: 'Conta corrente',
    POUPANCA: 'Conta poupança',
    SALARIO: 'Conta salário',
    PAGAMENTO: 'Conta de pagamento',
  };
  return valor ? rotulos[valor] : 'Não informado';
}

function rotuloEscolaridade(valor: FormacaoAcademicaResponse['escolaridade']): string {
  const rotulos = {
    ENSINO_FUNDAMENTAL: 'Ensino fundamental',
    ENSINO_MEDIO: 'Ensino médio',
    TECNICO: 'Técnico',
    TECNOLOGO: 'Tecnólogo',
    GRADUACAO: 'Graduação',
    POS_GRADUACAO: 'Pós-graduação',
    MBA: 'MBA',
    MESTRADO: 'Mestrado',
    DOUTORADO: 'Doutorado',
    POS_DOUTORADO: 'Pós-doutorado',
  };
  return rotulos[valor];
}

function Banner({
  texto,
  tone,
  onClose,
}: {
  texto: string;
  tone: 'erro' | 'sucesso';
  onClose: () => void;
}) {
  const erro = tone === 'erro';
  const Icone = erro ? CircleAlert : CircleCheck;
  return (
    <View
      style={[styles.banner, erro ? styles.bannerErro : styles.bannerSucesso]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Icone color={erro ? color.danger : color.brand} size={18} strokeWidth={2} />
      <Text style={[styles.bannerTexto, erro && styles.bannerTextoErro]}>{texto}</Text>
      <Pressable
        onPress={onClose}
        hitSlop={8}
        style={styles.bannerFechar}
        accessibilityRole="button"
        accessibilityLabel="Fechar aviso"
      >
        <X color={erro ? color.danger : color.brandStrong} size={16} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  tone,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  tone: 'primary' | 'dark' | 'danger' | 'ghost';
  disabled?: boolean;
}) {
  const toneStyle =
    tone === 'primary' || tone === 'dark'
      ? styles.action_primary
      : tone === 'danger'
        ? styles.action_danger
        : styles.action_ghost;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        toneStyle,
        pressed && (tone === 'ghost' ? styles.action_ghostPressed : styles.pressed),
        disabled && styles.actionDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.actionText, tone === 'ghost' && styles.actionTextGhost]}>{label}</Text>
    </Pressable>
  );
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.termoLink, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="link"
    >
      <Text style={styles.termoLinkTexto}>{label}</Text>
      <ExternalLink color={color.brand} size={14} strokeWidth={2.2} />
    </Pressable>
  );
}

function ListaBeneficios({ beneficios }: { beneficios: BeneficioResponse[] }) {
  if (!beneficios.length) {
    return <Empty text="Nenhum benefício cadastrado." />;
  }
  return (
    <View style={styles.stackInterno}>
      {beneficios.map((b) => (
        <ListItem
          key={b.id}
          title={rotuloBeneficio(b.tipo)}
          subtitle={b.descricao ?? 'Sem descrição'}
          right={!b.valor
            ? <Text style={styles.money}>Sem valor</Text>
            : <Text style={styles.money}>{formatarDinheiro(b.valor)}</Text>}
        />
      ))}
    </View>
  );
}

function ListaPonto({ ponto }: { ponto: EspelhoPontoResponse[] }) {
  if (!ponto.length) {
    return <Empty text="Nenhum espelho de ponto recebido." />;
  }
  return (
    <View style={styles.stackInterno}>
      {ponto.map((p) => (
        <ListItem
          key={p.id}
          title={`${String(p.mes).padStart(2, '0')}/${p.ano}`}
          subtitle={`Registrado por ${p.origem}`}
          right={
            <Text style={[styles.saldo, p.classificacao === 'NEGATIVO' && styles.saldoNegativo]}>
              {p.classificacao === 'POSITIVO' && !p.saldoFormatado.startsWith('+') ? '+' : ''}
              {p.saldoFormatado}
            </Text>
          }
        />
      ))}
    </View>
  );
}

function ListaHistoricoAlteracoes({
  historico,
}: {
  historico: HistoricoAlteracaoFuncionarioResponse[];
}) {
  if (!historico.length) {
    return <Empty text="Nenhuma modificação registrada." />;
  }
  return (
    <View style={styles.stackInterno}>
      {historico.map((item) => (
        <ListItem
          key={item.id}
          title={item.campo}
          subtitle={`${item.alteradoPorNome} - ${formatarDataHora(item.alteradoEm)}`}
        >
          <Text style={styles.historicoValor}>
            {item.valorAnterior ?? 'Não informado'} → {item.valorNovo ?? 'Não informado'}
          </Text>
        </ListItem>
      ))}
    </View>
  );
}

function obterAssinaturaAtual(
  consentimentos: ConsentimentoResponse[],
  termo: TermoLgpdResponse | null,
): ConsentimentoResponse | undefined {
  if (!termo) {
    return undefined;
  }

  return consentimentos.find(
    (consentimento) =>
      consentimento.aceito &&
      consentimento.versaoTermo === termo.versao &&
      consentimento.urlTermo === termo.url,
  );
}

function LgpdSection({
  consentimentos,
  termo,
  onAbrirTermos,
  onAssinar,
}: {
  consentimentos: ConsentimentoResponse[];
  termo: TermoLgpdResponse | null;
  onAbrirTermos: () => void;
  onAssinar: () => void;
}) {
  const assinatura = obterAssinaturaAtual(consentimentos, termo);

  return (
    <Section title="Termo LGPD" subtitle="Como a empresa trata seus dados pessoais">
      {termo ? (
        <>
          <Text style={styles.lgpdTexto}>
            A assinatura confirma que você leu os termos vigentes. Ela permanece válida durante
            seu vínculo com a empresa e será solicitada novamente apenas se os termos mudarem.
          </Text>
          <InfoLine label="Versão vigente" value={termo.versao} />
          <InfoLine
            label="Situação"
            value={assinatura ? 'Assinado' : 'Assinatura pendente'}
          />
          {assinatura ? (
            <InfoLine label="Assinado em" value={formatarDataHora(assinatura.registradoEm)} />
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.termoLink, pressed && styles.pressed]}
            onPress={onAbrirTermos}
          >
            <Text style={styles.termoLinkTexto}>Ler o termo completo</Text>
          </Pressable>
          {!assinatura ? (
            <ActionButton label="Assinar termo" onPress={onAssinar} tone="primary" />
          ) : null}
        </>
      ) : (
        <Empty text="Termo LGPD indisponível." />
      )}
    </Section>
  );
}

function ListItem({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listTop}>
        <View style={styles.listText}>
          <Text style={styles.listTitle}>{title}</Text>
          {subtitle ? <Text style={styles.listSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return <Text style={styles.empty}>{text}</Text>;
}

function formatarDataHora(valor: string): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return valor;
  }
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const senhaStyles = estilos(() => ({
  overlay: { flex: 1, backgroundColor: 'rgba(23,33,28,0.48)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 440, backgroundColor: color.surface, borderRadius: radius.lg, padding: 24, gap: 14 },
  title: { color: color.ink, ...type.title, fontWeight: '600' },
  description: { color: color.muted, ...type.body },
  input: { minHeight: 44, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, color: color.ink, ...type.body },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  error: { color: color.danger, backgroundColor: color.dangerSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, ...type.small },
}));

const styles = estilos(() => ({
  safe: {
    flex: 1,
    backgroundColor: color.canvas,
  },
  flex1: {
    flex: 1,
    minWidth: 0,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.canvas,
    gap: 12,
  },
  centroTexto: {
    color: color.muted,
    ...type.body,
  },

  // Estrutura
  luzPagina: {
    bottom: undefined,
    height: 420,
  },
  shellLinha: {
    flex: 1,
    flexDirection: 'row',
  },
  shellColuna: {
    flex: 1,
  },
  rolagem: {
    flex: 1,
  },
  conteudo: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  conteudoEstreito: {
    maxWidth: 960,
  },
  conteudoWeb: {
    maxWidth: LARGURA_CONTEUDO,
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 64,
    gap: 20,
  },

  // Barra superior (desktop)
  topo: {
    backgroundColor: color.header,
    borderBottomWidth: 1,
    borderBottomColor: color.headerLine,
    zIndex: 2,
    ...elevacao.barra,
  },
  topoInterno: {
    width: '100%',
    maxWidth: LARGURA_CONTEUDO,
    alignSelf: 'center',
    height: 64,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  topoMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topoMarcaNome: {
    color: color.onHeader,
    ...type.lead,
    fontWeight: '700',
  },
  topoNav: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topoTrilho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: color.navTrack,
  },
  topoItem: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  topoItemHover: {
    backgroundColor: color.navHover,
  },
  topoItemAtivo: {
    backgroundColor: color.navActive,
    ...elevacao.pilula,
  },
  topoItemTexto: {
    color: color.onHeaderMuted,
    ...type.small,
    fontWeight: '500',
  },
  topoItemTextoAtivo: {
    color: color.onHeader,
    fontWeight: '600',
  },
  topoConta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 2,
    paddingRight: 6,
    height: 44,
    borderRadius: 22,
  },
  menuContaFundo: {
    ...StyleSheet.absoluteFillObject,
  },
  menuConta: {
    position: 'absolute',
    top: 58,
    width: 280,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    padding: 8,
    ...elevacao.flutuante,
  },
  menuContaCabecalho: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
  },

  // Cartão de perfil (Início)
  perfilCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    overflow: 'hidden',
    ...elevacao.cartao,
  },
  perfilTopo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
  },
  perfilFaixa: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: color.sunken,
    overflow: 'hidden',
  },
  perfilAvatarAnel: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: color.surface,
    marginBottom: 6,
  },
  perfilPapel: {
    borderRadius: radius.pill,
    backgroundColor: color.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 4,
  },
  perfilPapelTexto: {
    color: color.brandStrong,
    ...type.caption,
    fontWeight: '600',
  },
  perfilNome: {
    color: color.ink,
    ...type.title,
    fontWeight: '600',
    textAlign: 'center',
  },
  perfilData: {
    color: color.muted,
    ...type.small,
  },
  perfilLista: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  perfilLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  perfilLinhaTexto: {
    flex: 1,
    minWidth: 0,
    color: color.inkSoft,
    ...type.small,
  },
  contador: {
    minWidth: 22,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorInvertido: {
    backgroundColor: color.surface,
  },
  contadorTexto: {
    color: color.onAccent,
    ...type.caption,
    fontWeight: '700',
  },
  contadorTextoInvertido: {
    color: color.brandDeep,
  },

  // Barra superior e inferior (mobile)
  barraSuperior: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: color.header,
    borderBottomWidth: 1,
    borderBottomColor: color.headerLine,
    zIndex: 2,
    ...elevacao.barra,
  },
  barraMarca: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barraSelo: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevacao.pilula,
  },
  barraLogo: {
    width: 20,
    height: 20,
  },
  barraTitulo: {
    flex: 1,
    color: color.onHeader,
    ...type.lead,
    fontWeight: '600',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    ...type.small,
    fontWeight: '700',
  },
  moduloIcone: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  barraInferior: {
    flexDirection: 'row',
    backgroundColor: color.header,
    borderTopWidth: 1,
    borderTopColor: color.headerLine,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 2 : 8,
  },
  barraInferiorItem: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  barraInferiorIcone: {
    width: 56,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barraInferiorIconeAtivo: {
    backgroundColor: color.brandSoft,
  },
  barraInferiorTexto: {
    color: color.muted,
    ...type.caption,
    fontWeight: '500',
  },
  barraInferiorTextoAtivo: {
    color: color.brandStrong,
    fontWeight: '600',
  },
  pontoAviso: {
    position: 'absolute',
    top: -1,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.dangerStrong,
    borderWidth: 1.5,
    borderColor: color.surface,
  },
  folhaFundo: {
    flex: 1,
    backgroundColor: 'rgba(23,33,28,0.4)',
  },
  folha: {
    backgroundColor: color.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  folhaAlca: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.lineStrong,
    marginTop: 8,
    marginBottom: 12,
  },
  folhaConta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingBottom: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
  },
  folhaNome: {
    color: color.ink,
    ...type.body,
    fontWeight: '600',
  },
  folhaPerfil: {
    color: color.muted,
    ...type.small,
  },
  folhaItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  folhaItemAtivo: {
    backgroundColor: color.brandSoft,
  },
  folhaItemTexto: {
    color: color.ink,
    ...type.body,
    fontWeight: '500',
  },
  folhaItemTextoAtivo: {
    color: color.brand,
    fontWeight: '600',
  },
  folhaSairTexto: {
    color: color.danger,
  },

  // Cabeçalho da página
  paginaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 4,
  },
  paginaTituloBloco: {
    flex: 1,
    gap: 4,
  },
  paginaTitulo: {
    color: color.ink,
    ...type.heading,
    fontWeight: '600',
  },
  paginaTituloWeb: {
    ...type.display,
  },
  paginaDescricao: {
    color: color.muted,
    ...type.body,
  },
  sincronizando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  sincronizandoTexto: {
    color: color.muted,
    ...type.small,
  },

  // Início
  inicioGrade: {
    gap: 16,
  },
  inicioGradeLarga: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  inicioPerfil: {
    width: 280,
    flexShrink: 0,
  },
  inicioPrincipal: {
    flex: 1,
    minWidth: 0,
  },
  inicioLateral: {
    width: 320,
    flexShrink: 0,
  },
  aviso: {
    backgroundColor: color.warningSoft,
    borderWidth: 1,
    borderColor: color.warningLine,
    borderLeftWidth: 4,
    borderLeftColor: tons.ambar.solido,
    borderRadius: radius.lg,
    padding: 20,
    gap: 6,
  },
  avisoTitulo: {
    color: color.ink,
    ...type.lead,
    fontWeight: '600',
  },
  avisoTexto: {
    color: color.inkSoft,
    ...type.body,
    maxWidth: 640,
    marginBottom: 6,
  },

  // Colunas
  colunas: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  colunaPrincipal: {
    flex: 1,
    minWidth: 0,
  },
  colunaLateral: {
    width: 380,
    flexShrink: 0,
  },

  // Blocos
  stack: {
    gap: 16,
  },
  stackInterno: {
    gap: 0,
  },
  section: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    padding: 20,
    gap: 12,
    ...elevacao.cartao,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    color: color.ink,
    ...type.lead,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: color.muted,
    ...type.small,
    marginTop: 2,
  },
  semDivisor: {
    borderTopWidth: 0,
  },
  notificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  notificacaoHover: {
    backgroundColor: color.sunken,
  },
  notificacaoConteudo: {
    flex: 1,
    gap: 2,
  },
  notificacaoTitulo: {
    color: color.ink,
    ...type.body,
    fontWeight: '600',
  },
  notificacaoDescricao: {
    color: color.muted,
    ...type.small,
  },
  notificacaoData: {
    color: color.muted,
    ...type.caption,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: color.line,
    paddingVertical: 10,
    gap: 16,
  },
  infoLabel: {
    color: color.muted,
    ...type.small,
    paddingTop: 1,
  },
  infoValue: {
    flex: 1,
    color: color.ink,
    ...type.body,
    fontWeight: '500',
    textAlign: 'right',
  },
  botoesLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  action: {
    marginTop: 8,
    minHeight: 40,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  action_primary: {
    backgroundColor: color.brand,
  },
  action_danger: {
    backgroundColor: color.dangerStrong,
  },
  action_ghost: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.lineStrong,
  },
  action_ghostPressed: {
    backgroundColor: color.sunken,
  },
  actionDisabled: {
    opacity: 0.55,
  },
  actionText: {
    color: color.onBrand,
    ...type.body,
    fontWeight: '600',
  },
  actionTextGhost: {
    color: color.ink,
  },
  pressed: {
    opacity: 0.85,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bannerErro: {
    backgroundColor: color.dangerSoft,
    borderColor: color.dangerLine,
  },
  bannerSucesso: {
    backgroundColor: color.brandSoft,
    borderColor: color.brandLine,
  },
  bannerTexto: {
    flex: 1,
    color: color.brandStrong,
    ...type.body,
  },
  bannerTextoErro: {
    color: color.danger,
  },
  bannerFechar: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    borderTopWidth: 1,
    borderTopColor: color.line,
    paddingVertical: 12,
    gap: 8,
  },
  listTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  listText: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    color: color.ink,
    ...type.body,
    fontWeight: '600',
  },
  listSubtitle: {
    color: color.muted,
    ...type.small,
  },
  empty: {
    color: color.muted,
    ...type.body,
    paddingVertical: 4,
  },
  money: {
    color: color.ink,
    fontWeight: '600',
    ...type.body,
  },
  saldo: {
    color: color.ink,
    fontWeight: '600',
    ...type.body,
  },
  saldoNegativo: {
    color: color.danger,
  },
  formacaoNivel: {
    maxWidth: 140,
    color: color.muted,
    ...type.small,
    textAlign: 'right',
  },
  historicoValor: {
    color: color.text,
    ...type.small,
  },
  lgpdTexto: {
    color: color.muted,
    ...type.small,
    marginBottom: 8,
  },
  termoLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  termoLinkTexto: {
    color: color.brand,
    ...type.body,
    fontWeight: '600',
  },
}));
