import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Crosshair,
  Minus,
  Plus,
  X,
} from 'lucide-react-native';

import { OrganogramaNode } from '@/api/types';
import { SearchInput } from '@/components/SearchInput';
import { ui } from '@/components/ui';
import { color, estilos, radius, tomDoNome, type } from '@/constants/theme';

type Pessoa = OrganogramaNode & {
  gestorId: number | null;
  nivel: number;
  totalEquipe: number;
};

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.4;
const PROFUNDIDADE_INICIAL = 2;

export function OrganogramaSection({ organograma }: { organograma: OrganogramaNode[] }) {
  const { width } = useWindowDimensions();
  const largo = width >= 1024;

  const pessoas = useMemo(() => indexar(organograma), [organograma]);
  const [abertos, setAbertos] = useState<Set<number>>(() => abertosAte(organograma, PROFUNDIDADE_INICIAL));
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [focoId, setFocoId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(largo ? 1 : 0.8);
  const [pesquisa, setPesquisa] = useState('');

  const refs = useRef(new Map<number, View | null>());
  const canvas = useRef<ScrollView>(null);
  const [tamanho, setTamanho] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setAbertos(abertosAte(organograma, PROFUNDIDADE_INICIAL));
  }, [organograma]);

  const raizes = useMemo(() => {
    if (focoId !== null) {
      const foco = pessoas.get(focoId);
      if (foco) return [foco as OrganogramaNode];
    }
    return organograma;
  }, [focoId, organograma, pessoas]);

  const selecionado = selecionadoId !== null ? pessoas.get(selecionadoId) ?? null : null;
  const termo = pesquisa.trim().toLocaleLowerCase('pt-BR');
  const resultados = termo
    ? [...pessoas.values()]
        .filter((p) => `${p.nome} ${p.cargoNome ?? ''} ${p.departamentoNome ?? ''}`
          .toLocaleLowerCase('pt-BR').includes(termo))
        .slice(0, 6)
    : [];

  const rolarAte = useCallback((id: number) => {
    if (Platform.OS !== 'web') return;
    // No web, cada View é um elemento DOM; o navegador centraliza o card na área visível.
    setTimeout(() => {
      const no = refs.current.get(id) as unknown as HTMLElement | null;
      no?.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, 60);
  }, []);

  function alternar(id: number) {
    setAbertos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  function irPara(id: number) {
    const caminho = caminhoAte(id, pessoas);
    setAbertos((atual) => new Set([...atual, ...caminho]));
    if (focoId !== null && !caminho.includes(focoId)) setFocoId(null);
    setSelecionadoId(id);
    setPesquisa('');
    rolarAte(id);
  }

  function focar(id: number | null) {
    setFocoId(id);
    if (id !== null) {
      setAbertos((atual) => new Set([...atual, id]));
      setSelecionadoId(id);
    }
    setTimeout(() => centralizarHorizontal(), 60);
  }

  function centralizarHorizontal() {
    const node = (canvas.current as unknown as { getScrollableNode?: () => HTMLElement })?.getScrollableNode?.();
    if (node) node.scrollTo({ left: (node.scrollWidth - node.clientWidth) / 2, top: 0, behavior: 'smooth' });
  }

  // Arrastar com o mouse para navegar pelo organograma (web).
  const arraste = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const eventosArraste = Platform.OS === 'web'
    ? {
        onMouseDown: (e: { clientX: number; clientY: number; target: EventTarget }) => {
          const alvo = e.target as HTMLElement;
          if (alvo.closest?.('[role="button"]')) return;
          const node = (canvas.current as unknown as { getScrollableNode?: () => HTMLElement })?.getScrollableNode?.();
          if (!node) return;
          arraste.current = { x: e.clientX, y: e.clientY, left: node.scrollLeft, top: node.scrollTop };
          const mover = (ev: MouseEvent) => {
            if (!arraste.current) return;
            node.scrollLeft = arraste.current.left - (ev.clientX - arraste.current.x);
            node.scrollTop = arraste.current.top - (ev.clientY - arraste.current.y);
          };
          const soltar = () => {
            arraste.current = null;
            window.removeEventListener('mousemove', mover);
            window.removeEventListener('mouseup', soltar);
          };
          window.addEventListener('mousemove', mover);
          window.addEventListener('mouseup', soltar);
        },
      }
    : {};

  useEffect(() => {
    const t = setTimeout(() => centralizarHorizontal(), 120);
    return () => clearTimeout(t);
  }, [tamanho.w]);

  const caminhoFoco = focoId !== null ? caminhoAte(focoId, pessoas) : [];

  const arvore = (
    <View style={styles.floresta}>
      {raizes.map((raiz) => (
        <No
          key={raiz.id}
          pessoa={raiz}
          abertos={abertos}
          selecionadoId={selecionadoId}
          pessoas={pessoas}
          refs={refs.current}
          onAlternar={alternar}
          onSelecionar={setSelecionadoId}
        />
      ))}
    </View>
  );

  return (
    <View style={[ui.section, styles.secao]}>
      <View style={styles.ferramentas}>
        <View style={styles.busca}>
          <SearchInput
            value={pesquisa}
            onChangeText={setPesquisa}
            placeholder="Buscar pessoa, cargo ou departamento"
          />
          {termo ? (
            <View style={styles.resultados}>
              {resultados.length ? resultados.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => irPara(p.id)}
                  style={(estado) => [
                    styles.resultado,
                    ((estado as { hovered?: boolean }).hovered || estado.pressed) && styles.resultadoHover,
                  ]}
                  accessibilityRole="button"
                >
                  <Avatar nome={p.nome} pequeno />
                  <View style={ui.rowText}>
                    <Text style={styles.resultadoNome} numberOfLines={1}>{p.nome}</Text>
                    <Text style={ui.rowMeta} numberOfLines={1}>
                      {p.cargoNome ?? 'Cargo não informado'}
                      {p.departamentoNome ? `, ${p.departamentoNome}` : ''}
                    </Text>
                  </View>
                </Pressable>
              )) : <Text style={[ui.empty, styles.semResultado]}>Ninguém encontrado com “{pesquisa.trim()}”.</Text>}
            </View>
          ) : null}
        </View>

        <View style={styles.botoes}>
          <BotaoFerramenta
            rotulo="Abrir tudo"
            Icone={ChevronsUpDown}
            onPress={() => setAbertos(new Set(pessoas.keys()))}
          />
          <BotaoFerramenta
            rotulo="Recolher"
            Icone={ChevronsDownUp}
            onPress={() => setAbertos(new Set(raizes.map((r) => r.id)))}
          />
          <View style={styles.zoom}>
            <Pressable
              onPress={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.1).toFixed(2)))}
              style={styles.zoomBotao}
              accessibilityRole="button"
              accessibilityLabel="Diminuir zoom"
            >
              <Minus color={color.inkSoft} size={16} strokeWidth={2.2} />
            </Pressable>
            <Pressable onPress={() => setZoom(1)} accessibilityRole="button" accessibilityLabel="Zoom padrão">
              <Text style={styles.zoomValor}>{Math.round(zoom * 100)}%</Text>
            </Pressable>
            <Pressable
              onPress={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.1).toFixed(2)))}
              style={styles.zoomBotao}
              accessibilityRole="button"
              accessibilityLabel="Aumentar zoom"
            >
              <Plus color={color.inkSoft} size={16} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
      </View>

      {focoId !== null ? (
        <View style={styles.trilha}>
          <Pressable onPress={() => focar(null)} accessibilityRole="link">
            <Text style={styles.trilhaLink}>Empresa inteira</Text>
          </Pressable>
          {caminhoFoco.map((id, i) => {
            const p = pessoas.get(id);
            const ultimo = i === caminhoFoco.length - 1;
            return (
              <View key={id} style={styles.trilhaItem}>
                <ChevronRight color={color.placeholder} size={14} strokeWidth={2} />
                {ultimo ? (
                  <Text style={styles.trilhaAtual}>Equipe de {p?.nome}</Text>
                ) : (
                  <Pressable onPress={() => focar(id)} accessibilityRole="link">
                    <Text style={styles.trilhaLink}>{p?.nome}</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={[styles.area, largo && styles.areaLarga]}>
        <View style={[styles.canvasMoldura, largo && styles.canvasMolduraLarga]}>
          <ScrollView
            ref={canvas}
            horizontal={false}
            style={styles.canvas}
            contentContainerStyle={styles.canvasConteudo}
          >
            <ScrollView horizontal contentContainerStyle={styles.canvasConteudoH} nestedScrollEnabled>
              <View
                {...(eventosArraste as object)}
                style={[
                  styles.palco,
                  { width: tamanho.w * zoom, height: tamanho.h * zoom },
                  Platform.OS === 'web' ? ({ cursor: 'grab' } as object) : null,
                ]}
              >
                <View
                  onLayout={(e: LayoutChangeEvent) => {
                    const { width: w, height: h } = e.nativeEvent.layout;
                    if (Math.abs(w - tamanho.w) > 1 || Math.abs(h - tamanho.h) > 1) setTamanho({ w, h });
                  }}
                  style={[
                    styles.escala,
                    { transform: [{ scale: zoom }] },
                    Platform.OS === 'web' ? ({ transformOrigin: 'top left' } as object) : null,
                  ]}
                >
                  {arvore}
                </View>
              </View>
            </ScrollView>
          </ScrollView>
          {Platform.OS === 'web' ? (
            <Text style={styles.dica}>Arraste para navegar. Clique numa pessoa para ver detalhes.</Text>
          ) : null}
        </View>

        <Detalhe
          pessoa={selecionado}
          pessoas={pessoas}
          largo={largo}
          focado={focoId === selecionadoId}
          onFechar={() => setSelecionadoId(null)}
          onIrPara={irPara}
          onFocar={focar}
        />
      </View>
    </View>
  );
}

function No({
  pessoa,
  abertos,
  selecionadoId,
  pessoas,
  refs,
  onAlternar,
  onSelecionar,
}: {
  pessoa: OrganogramaNode;
  abertos: Set<number>;
  selecionadoId: number | null;
  pessoas: Map<number, Pessoa>;
  refs: Map<number, View | null>;
  onAlternar: (id: number) => void;
  onSelecionar: (id: number) => void;
}) {
  const filhos = pessoa.subordinados;
  const aberto = abertos.has(pessoa.id) && filhos.length > 0;
  const ativo = selecionadoId === pessoa.id;
  const total = pessoas.get(pessoa.id)?.totalEquipe ?? 0;

  return (
    <View style={styles.no}>
      <Pressable
        ref={(r) => { refs.set(pessoa.id, r as unknown as View | null); }}
        onPress={() => onSelecionar(pessoa.id)}
        accessibilityRole="button"
        accessibilityLabel={`${pessoa.nome}, ${pessoa.cargoNome ?? 'cargo não informado'}`}
        accessibilityState={{ selected: ativo }}
        style={(estado) => [
          styles.card,
          (estado as { hovered?: boolean }).hovered && !ativo && styles.cardHover,
          ativo && styles.cardAtivo,
        ]}
      >
        <Avatar nome={pessoa.nome} destaque={ativo} />
        <View style={styles.cardTexto}>
          <Text style={styles.cardNome} numberOfLines={1}>{pessoa.nome}</Text>
          <Text style={styles.cardCargo} numberOfLines={1}>{pessoa.cargoNome ?? 'Cargo não informado'}</Text>
          <Text style={styles.cardDepto} numberOfLines={1}>{pessoa.departamentoNome ?? 'Sem departamento'}</Text>
        </View>
      </Pressable>

      {filhos.length ? (
        <>
          <View style={styles.linhaV} />
          <Pressable
            onPress={() => onAlternar(pessoa.id)}
            accessibilityRole="button"
            accessibilityLabel={aberto ? `Recolher equipe de ${pessoa.nome}` : `Abrir equipe de ${pessoa.nome}`}
            accessibilityState={{ expanded: aberto }}
            style={(estado) => [
              styles.alternar,
              aberto && styles.alternarAberto,
              (estado as { hovered?: boolean }).hovered && styles.alternarHover,
            ]}
          >
            {aberto
              ? <ChevronDown color={color.brandStrong} size={14} strokeWidth={2.4} />
              : <ChevronRight color={color.inkSoft} size={14} strokeWidth={2.4} />}
            <Text style={[styles.alternarTexto, aberto && styles.alternarTextoAberto]}>
              {aberto ? filhos.length : total}
            </Text>
          </Pressable>
        </>
      ) : null}

      {aberto ? (
        <>
          <View style={styles.linhaV} />
          <View style={styles.filhos}>
            {filhos.map((filho, i) => (
              <View key={filho.id} style={styles.ramo}>
                <View style={styles.conector}>
                  <View style={[styles.conectorMetade, styles.conectorEsquerda, i > 0 && styles.conectorTopo]} />
                  <View style={[styles.conectorMetade, i < filhos.length - 1 && styles.conectorTopo]} />
                </View>
                <No
                  pessoa={filho}
                  abertos={abertos}
                  selecionadoId={selecionadoId}
                  pessoas={pessoas}
                  refs={refs}
                  onAlternar={onAlternar}
                  onSelecionar={onSelecionar}
                />
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function Detalhe({
  pessoa,
  pessoas,
  largo,
  focado,
  onFechar,
  onIrPara,
  onFocar,
}: {
  pessoa: Pessoa | null;
  pessoas: Map<number, Pessoa>;
  largo: boolean;
  focado: boolean;
  onFechar: () => void;
  onIrPara: (id: number) => void;
  onFocar: (id: number) => void;
}) {
  if (!pessoa) {
    if (!largo) return null;
    return (
      <View style={[styles.detalhe, styles.detalheVazio]}>
        <Text style={ui.title}>Estrutura da empresa</Text>
        <Text style={ui.subtitle}>
          {pessoas.size} {pessoas.size === 1 ? 'pessoa' : 'pessoas'}. Clique em alguém para ver a quem
          responde e quem faz parte da equipe.
        </Text>
      </View>
    );
  }

  const gestor = pessoa.gestorId !== null ? pessoas.get(pessoa.gestorId) : undefined;
  return (
    <View style={[styles.detalhe, !largo && styles.detalheCompacto]}>
      <View style={styles.detalheTopo}>
        <Avatar nome={pessoa.nome} grande />
        <View style={ui.rowText}>
          <Text style={styles.detalheNome}>{pessoa.nome}</Text>
          <Text style={ui.subtitle}>{pessoa.cargoNome ?? 'Cargo não informado'}</Text>
        </View>
        <Pressable onPress={onFechar} style={ui.iconButton} accessibilityRole="button" accessibilityLabel="Fechar detalhes">
          <X color={color.muted} size={18} strokeWidth={2} />
        </Pressable>
      </View>

      <View>
        <Info rotulo="Departamento" valor={pessoa.departamentoNome ?? 'Sem departamento'} />
        <Info rotulo="Equipe direta" valor={String(pessoa.subordinados.length)} />
        <Info rotulo="Equipe total" valor={String(pessoa.totalEquipe)} />
      </View>

      <View style={styles.detalheBloco}>
        <Text style={styles.detalheRotulo}>Responde a</Text>
        {gestor ? (
          <PessoaLinha pessoa={gestor} onPress={() => onIrPara(gestor.id)} />
        ) : (
          <Text style={ui.rowMeta}>Conselho e acionistas</Text>
        )}
      </View>

      {pessoa.subordinados.length ? (
        <View style={styles.detalheBloco}>
          <Text style={styles.detalheRotulo}>Equipe direta</Text>
          {pessoa.subordinados.map((s) => (
            <PessoaLinha key={s.id} pessoa={s} onPress={() => onIrPara(s.id)} />
          ))}
        </View>
      ) : null}

      {pessoa.subordinados.length && !focado ? (
        <Pressable
          onPress={() => onFocar(pessoa.id)}
          style={({ pressed }) => [ui.btnSm, ui.btnSecondary, styles.focarBotao, pressed && { backgroundColor: color.sunken }]}
          accessibilityRole="button"
        >
          <Crosshair color={color.inkSoft} size={14} strokeWidth={2.2} />
          <Text style={ui.btnTextSm}>Mostrar só esta equipe</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function PessoaLinha({ pessoa, onPress }: { pessoa: OrganogramaNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={(estado) => [
        styles.pessoaLinha,
        ((estado as { hovered?: boolean }).hovered || estado.pressed) && styles.resultadoHover,
      ]}
      accessibilityRole="link"
    >
      <Avatar nome={pessoa.nome} pequeno />
      <View style={ui.rowText}>
        <Text style={styles.resultadoNome} numberOfLines={1}>{pessoa.nome}</Text>
        <Text style={ui.rowMeta} numberOfLines={1}>{pessoa.cargoNome ?? 'Cargo não informado'}</Text>
      </View>
      <ChevronRight color={color.placeholder} size={16} strokeWidth={2} />
    </Pressable>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.info}>
      <Text style={ui.rowMeta}>{rotulo}</Text>
      <Text style={styles.infoValor}>{valor}</Text>
    </View>
  );
}

function BotaoFerramenta({
  rotulo,
  Icone,
  onPress,
}: {
  rotulo: string;
  Icone: typeof Plus;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [ui.btnSm, ui.btnSecondary, pressed && { backgroundColor: color.sunken }]}
      accessibilityRole="button"
    >
      <Icone color={color.inkSoft} size={14} strokeWidth={2.2} />
      <Text style={ui.btnTextSm}>{rotulo}</Text>
    </Pressable>
  );
}

function Avatar({
  nome,
  destaque = false,
  pequeno = false,
  grande = false,
}: {
  nome: string;
  destaque?: boolean;
  pequeno?: boolean;
  grande?: boolean;
}) {
  const tom = tomDoNome(nome);
  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: tom.suave },
        pequeno && styles.avatarPequeno,
        grande && styles.avatarGrande,
        destaque && styles.avatarDestaque,
      ]}
    >
      <Text style={[styles.avatarTexto, { color: tom.texto }, pequeno && styles.avatarTextoPequeno, destaque && styles.avatarTextoDestaque]}>
        {iniciais(nome)}
      </Text>
    </View>
  );
}

function indexar(nodes: OrganogramaNode[]): Map<number, Pessoa> {
  const mapa = new Map<number, Pessoa>();
  const visitar = (no: OrganogramaNode, gestorId: number | null, nivel: number): number => {
    const pessoa: Pessoa = { ...no, gestorId, nivel, totalEquipe: 0 };
    mapa.set(no.id, pessoa);
    pessoa.totalEquipe = no.subordinados.reduce((soma, f) => soma + 1 + visitar(f, no.id, nivel + 1), 0);
    return pessoa.totalEquipe;
  };
  nodes.forEach((raiz) => visitar(raiz, null, 0));
  return mapa;
}

function abertosAte(nodes: OrganogramaNode[], profundidade: number): Set<number> {
  const ids = new Set<number>();
  const visitar = (no: OrganogramaNode, nivel: number) => {
    if (nivel >= profundidade) return;
    ids.add(no.id);
    no.subordinados.forEach((f) => visitar(f, nivel + 1));
  };
  nodes.forEach((raiz) => visitar(raiz, 0));
  return ids;
}

/** Ids do topo até a pessoa (inclusive). */
function caminhoAte(id: number, pessoas: Map<number, Pessoa>): number[] {
  const caminho: number[] = [];
  let atual = pessoas.get(id);
  const vistos = new Set<number>();
  while (atual && !vistos.has(atual.id)) {
    vistos.add(atual.id);
    caminho.unshift(atual.id);
    atual = atual.gestorId !== null ? pessoas.get(atual.gestorId) : undefined;
  }
  return caminho;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

const LARGURA_CARD = 220;
const ALTURA_LIGACAO = 18;

const styles = estilos(() => ({
  secao: { gap: 14 },
  ferramentas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    zIndex: 5,
  },
  busca: { flexGrow: 1, flexBasis: 280, maxWidth: 440, zIndex: 5 },
  resultados: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    padding: 6,
    shadowColor: '#17211C',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  resultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  resultadoHover: { backgroundColor: color.canvas },
  resultadoNome: { color: color.ink, ...type.small, fontWeight: '600' },
  semResultado: { paddingHorizontal: 8 },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  zoom: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.md,
    height: 32,
  },
  zoomBotao: { width: 32, height: 30, alignItems: 'center', justifyContent: 'center' },
  zoomValor: { minWidth: 44, textAlign: 'center', color: color.inkSoft, ...type.small, fontWeight: '600' },
  trilha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  trilhaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trilhaLink: { color: color.brand, ...type.small, fontWeight: '600' },
  trilhaAtual: { color: color.ink, ...type.small, fontWeight: '600' },

  area: { gap: 16 },
  areaLarga: { flexDirection: 'row', alignItems: 'stretch' },
  canvasMoldura: { gap: 6 },
  canvasMolduraLarga: { flex: 1, minWidth: 0 },
  canvas: {
    height: 560,
    backgroundColor: color.canvas,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
  },
  canvasConteudo: { flexGrow: 1 },
  canvasConteudoH: { flexGrow: 1, justifyContent: 'center' },
  palco: { overflow: 'hidden' },
  escala: { position: 'absolute', top: 0, left: 0, padding: 32 },
  dica: { color: color.muted, ...type.caption },

  floresta: { flexDirection: 'row', alignItems: 'flex-start', gap: 48 },
  no: { alignItems: 'center' },
  card: {
    width: LARGURA_CARD,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
  },
  cardHover: { borderColor: color.lineStrong },
  cardAtivo: { borderColor: color.brand, borderWidth: 2, padding: 9 },
  cardTexto: { flex: 1, minWidth: 0 },
  cardNome: { color: color.ink, ...type.small, fontWeight: '600' },
  cardCargo: { color: color.text, ...type.caption },
  cardDepto: { color: color.muted, ...type.caption },
  linhaV: { width: 1, height: ALTURA_LIGACAO / 2, backgroundColor: color.lineStrong },
  alternar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 22,
    paddingLeft: 5,
    paddingRight: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
  },
  alternarAberto: { borderColor: color.brandLine, backgroundColor: color.brandSoft },
  alternarHover: { borderColor: color.brand },
  alternarTexto: { color: color.inkSoft, ...type.caption, fontWeight: '600' },
  alternarTextoAberto: { color: color.brandStrong },
  filhos: { flexDirection: 'row', alignItems: 'flex-start' },
  ramo: { alignItems: 'center', paddingHorizontal: 10 },
  conector: { flexDirection: 'row', alignSelf: 'stretch', height: ALTURA_LIGACAO, marginHorizontal: -10 },
  conectorMetade: { flex: 1, borderColor: color.lineStrong },
  conectorEsquerda: { borderRightWidth: 1 },
  conectorTopo: { borderTopWidth: 1 },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPequeno: { width: 30, height: 30, borderRadius: 15 },
  avatarGrande: { width: 48, height: 48, borderRadius: 24 },
  avatarDestaque: { backgroundColor: color.brand },
  avatarTexto: { color: color.brandStrong, ...type.small, fontWeight: '700' },
  avatarTextoPequeno: { ...type.caption, fontWeight: '600' },
  avatarTextoDestaque: { color: color.onBrand },

  detalhe: {
    width: 300,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    padding: 16,
    gap: 14,
    backgroundColor: color.surface,
  },
  detalheCompacto: { width: '100%' },
  detalheVazio: { justifyContent: 'flex-start', gap: 6 },
  detalheTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detalheNome: { color: color.ink, ...type.lead, fontWeight: '600' },
  detalheBloco: { gap: 2 },
  detalheRotulo: { color: color.muted, ...type.caption, fontWeight: '600', marginBottom: 4 },
  pessoaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginHorizontal: -6,
    borderRadius: radius.md,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  infoValor: { color: color.ink, ...type.small, fontWeight: '600' },
  focarBotao: { alignSelf: 'flex-start' },
}));
