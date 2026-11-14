import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SHADOW_ACTORS, type ShadowActor } from '@/lib/data/shadow'
import { cn } from '@/lib/utils'

const CUSTOM_SHADOW_KEY = 'mejora_shadow_custom_v1'

interface EnrichedShadowOperator extends ShadowActor {
  id: string
  categoryLabel: string
  categoryIcon: string
  vetoPower: number
  decisionAccess: number
  agendaControl: number
  ruptureRisk: number
  incentiveDriver: string
  neutralizeTactic: string
  alignTactic: string
  isCustom?: boolean
}

const POLITICAL_ENRICHMENT: Record<
  string,
  Omit<EnrichedShadowOperator, 'id' | 'name' | 'role' | 'note' | 'categoryLabel' | 'categoryIcon'>
> = {
  'Cristian Auguarda': {
    vetoPower: 78,
    decisionAccess: 88,
    agendaControl: 62,
    ruptureRisk: 72,
    incentiveDriver: 'Preservación del control operativo de inteligencia frente a avances internos.',
    neutralizeTactic: 'Segmentar canales de información verificable y evitar dependencia de un único reporte.',
    alignTactic: 'Alinear entregas con objetivos de estabilidad e institucionalidad antes de movimientos internos.',
  },
  'Eduardo Casal': {
    vetoPower: 86,
    decisionAccess: 70,
    agendaControl: 54,
    ruptureRisk: 42,
    incentiveDriver: 'Equilibrio institucional y permanencia sin escalada abierta con la Corte.',
    neutralizeTactic: 'Blindar legalmente toda reforma por trámite ordinario para minimizar frentes judiciales.',
    alignTactic: 'Consultar marcos procesales anticipadamente en mesas técnicas discretas.',
  },
  'Ángelici': {
    vetoPower: 74,
    decisionAccess: 76,
    agendaControl: 58,
    ruptureRisk: 48,
    incentiveDriver: 'Construcción de acuerdos transversales en nombramientos y arbitrajes.',
    neutralizeTactic: 'Ampliar coalición de respaldo en comisiones clave antes de someter pliegos críticos.',
    alignTactic: 'Estructurar contrapartidas verificables y escalonadas de cumplimiento.',
  },
  'Gordo Dan': {
    vetoPower: 45,
    decisionAccess: 82,
    agendaControl: 94,
    ruptureRisk: 68,
    incentiveDriver: 'Lealtad digital, tracción de audiencia y encuadre narrativo en redes.',
    neutralizeTactic: 'No confrontar en su propia arena digital; mostrar resultados tangibles en economía real.',
    alignTactic: 'Proveer hitos claros y datos simples que faciliten defensa orgánica ante shocks.',
  },
  'Agustín Laje': {
    vetoPower: 38,
    decisionAccess: 74,
    agendaControl: 89,
    ruptureRisk: 35,
    incentiveDriver: 'Coherencia doctrinal y liderazgo de batalla cultural.',
    neutralizeTactic: 'Enmarcar decisiones pragmáticas como tácticas temporales de preservación del rumbo.',
    alignTactic: 'Documentar el fundamento de principios detrás de cada reforma estructural.',
  },
  'Techint / Rocca': {
    vetoPower: 84,
    decisionAccess: 85,
    agendaControl: 79,
    ruptureRisk: 60,
    incentiveDriver: 'Previsibilidad energética, tipo de cambio competitivo y protección frente a dumping.',
    neutralizeTactic: 'Diversificar proveedores y competidores en licitaciones estratégicas.',
    alignTactic: 'Vincular incentivos (RIGI / Vaca Muerta) a metas exportadoras y desarrollo PyME.',
  },
  'YPF / Vaca Muerta': {
    vetoPower: 88,
    decisionAccess: 90,
    agendaControl: 76,
    ruptureRisk: 52,
    incentiveDriver: 'Ingreso de divisas netas, escala de infraestructura y alianzas con majors globales.',
    neutralizeTactic: 'Asegurar reglas estables de largo plazo para no frenar el CAPEX de socios internacionales.',
    alignTactic: 'Priorizar ductos, salida exportadora de GNL y cadenas de valor locales.',
  },
  'Grupo Clarín / La Nación': {
    vetoPower: 65,
    decisionAccess: 78,
    agendaControl: 95,
    ruptureRisk: 58,
    incentiveDriver: 'Sostenibilidad del negocio multimedia, pauta, telecomunicaciones y agenda institucional.',
    neutralizeTactic: 'Sostener transparencia de datos oficiales y comunicación directa multicanal.',
    alignTactic: 'Garantizar previsibilidad regulatoria en competencia de telecomunicaciones y medios.',
  },
}

const ENTERPRISE_SHADOW_OPERATORS: EnrichedShadowOperator[] = [
  {
    id: 'ent_tech_gatekeeper',
    name: 'Gatekeeper Técnico / Sistemas',
    role: 'Arquitectura y Accesos Críticos',
    categoryLabel: 'Operativo / Digital',
    categoryIcon: '🔐',
    note: 'Controla despliegues, bases de datos o know-how no documentado; puede frenar cualquier proyecto alegando riesgo técnico.',
    vetoPower: 84,
    decisionAccess: 72,
    agendaControl: 65,
    ruptureRisk: 74,
    incentiveDriver: 'Autonomía técnica, evitar deuda operativa impagable y reconocimiento experto.',
    neutralizeTactic: 'Exigir documentación modular, runbooks compartidos y redundancia de permisos antes de cambios críticos.',
    alignTactic: 'Involucrarlo en la fase de diseño como co-arquitecto y asignarle presupuesto de refactorización.',
  },
  {
    id: 'ent_trusted_advisor',
    name: 'Asesor de Confianza de Socios',
    role: 'Consejo Informal del Directorio',
    categoryLabel: 'Círculo Íntimo',
    categoryIcon: '🧭',
    note: 'Sin cargo gerencial en el organigrama, pero su opinión de último minuto define inversiones, despidos o alianzas.',
    vetoPower: 80,
    decisionAccess: 96,
    agendaControl: 78,
    ruptureRisk: 45,
    incentiveDriver: 'Proteger patrimonio y reputación de los fundadores minimizando exposición personal.',
    neutralizeTactic: 'Presentar propuestas con Matriz de Riesgo (Wald/Savage) y One-Pager ejecutivo previo a la reunión.',
    alignTactic: 'Hacer pre-briefing de 15 minutos con escenarios de stop-loss claros antes de pedir aprobación.',
  },
  {
    id: 'ent_floor_leader',
    name: 'Líder de Opinión Informal (Planta / Ventas)',
    role: 'Referente Territorial Interno',
    categoryLabel: 'Equipo / Operaciones',
    categoryIcon: '📣',
    note: 'Determina la adopción real o boicot silencioso de nuevas herramientas, comisiones o cambios de proceso.',
    vetoPower: 76,
    decisionAccess: 55,
    agendaControl: 88,
    ruptureRisk: 70,
    incentiveDriver: 'Cuidar ingreso variable, previsibilidad horaria y respeto entre pares.',
    neutralizeTactic: 'No imponer reformas por memorándum; lanzar pilotos Puerta Tipo 2 con voluntarios.',
    alignTactic: 'Transformarlo en embajador del piloto compartiendo métricas de éxito rápido.',
  },
  {
    id: 'ent_monopoly_supplier',
    name: 'Proveedor Monopólico de Insumo Crítico',
    role: 'Cuello de Botella Externo',
    categoryLabel: 'Cadena de Suministro',
    categoryIcon: '⛓️',
    note: 'Concentra licencias, repuestos o materia prima difícil de sustituir; captura margen ante escasez o suba del dólar.',
    vetoPower: 90,
    decisionAccess: 62,
    agendaControl: 52,
    ruptureRisk: 82,
    incentiveDriver: 'Volumen comprometido, puntualidad de pago en moneda dura y bloqueo de sustitutos.',
    neutralizeTactic: 'Desarrollar segundo proveedor calificado (dual-sourcing) aunque cubra inicialmente 15% del volumen.',
    alignTactic: 'Negociar contratos escalonados por volumen con cláusula de nivel de servicio (SLA).',
  },
  {
    id: 'ent_compliance_auditor',
    name: 'Auditor / Compliance / Estudio Legal',
    role: 'Veto Normativo e Impositivo',
    categoryLabel: 'Institucional / Legal',
    categoryIcon: '⚖️',
    note: 'Tiene poder de freno automático sobre lanzamientos comerciales, contratos internacionales o esquemas fiscales.',
    vetoPower: 88,
    decisionAccess: 80,
    agendaControl: 60,
    ruptureRisk: 40,
    incentiveDriver: 'Cero exposición a contingencias penales, laborales o regulatorias.',
    neutralizeTactic: 'Enmarcar iniciativas nuevas en sandboxes acotados con topes de facturación inicial.',
    alignTactic: 'Pedir diseño de alternativa viable ("cómo sí hacerlo dentro de la norma") en vez de pedir solo autorización.',
  },
  {
    id: 'ent_key_account_op',
    name: 'Operador / Buyer de Cuenta Clave',
    role: 'Llave de Ingresos Pareto',
    categoryLabel: 'Comercial / B2B',
    categoryIcon: '💼',
    note: 'Controla renovaciones o licitaciones del cliente que explica 20–40% del margen operativo de la compañía.',
    vetoPower: 82,
    decisionAccess: 74,
    agendaControl: 68,
    ruptureRisk: 78,
    incentiveDriver: 'Comisiones, estatus frente a sus superiores y cero fallas operativas visibles.',
    neutralizeTactic: 'Construir relación multi-hilo (multithreading) con al menos 3 decisores dentro del cliente.',
    alignTactic: 'Entregar tableros de valor y ROI trimestrales que hagan lucir su gestión internamente.',
  },
]

function loadCustomOperators(): EnrichedShadowOperator[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SHADOW_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as EnrichedShadowOperator[]
    }
  } catch {
    // ignore
  }
  return []
}

const SECTIONS = [
  { key: 'judicial' as const, label: 'Judicial / Inteligencia', icon: '⚖️' },
  { key: 'digital' as const, label: 'Ecosistema Digital', icon: '🌐' },
  { key: 'economic' as const, label: 'Económico / Corporativo', icon: '💰' },
]

export default function SombraPage() {
  const [contextMode, setContextMode] = useState<'political' | 'enterprise'>('political')
  const [customOps, setCustomOps] = useState<EnrichedShadowOperator[]>(() =>
    loadCustomOperators(),
  )
  const [selectedId, setSelectedId] = useState<string>('pol_Cristian Auguarda')

  // Formulario para operador propio en modo empresarial
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [newName, setNewName] = useState<string>('')
  const [newRole, setNewRole] = useState<string>('Operador Informal / Gatekeeper')
  const [newNote, setNewNote] = useState<string>('')
  const [newVeto, setNewVeto] = useState<number>(75)
  const [newAccess, setNewAccess] = useState<number>(80)

  const politicalOperators: EnrichedShadowOperator[] = useMemo(() => {
    const list: EnrichedShadowOperator[] = []
    SECTIONS.forEach((sec) => {
      SHADOW_ACTORS[sec.key].forEach((actor) => {
        const extra = POLITICAL_ENRICHMENT[actor.name] ?? {
          vetoPower: 65,
          decisionAccess: 70,
          agendaControl: 65,
          ruptureRisk: 50,
          incentiveDriver: 'Preservación de cuota de influencia informal.',
          neutralizeTactic: 'Diversificar fuentes y construir alternativas transparentes.',
          alignTactic: 'Negociar acuerdos con hitos verificables.',
        }
        list.push({
          ...actor,
          id: `pol_${actor.name}`,
          categoryLabel: sec.label,
          categoryIcon: sec.icon,
          ...extra,
        })
      })
    })
    return list
  }, [])

  const enterpriseOperators = useMemo(
    () => [...ENTERPRISE_SHADOW_OPERATORS, ...customOps],
    [customOps],
  )

  const activeList =
    contextMode === 'political' ? politicalOperators : enterpriseOperators

  const selectedOperator = useMemo(
    () => activeList.find((o) => o.id === selectedId) ?? activeList[0] ?? null,
    [activeList, selectedId],
  )

  const handleSwitchMode = (mode: 'political' | 'enterprise') => {
    setContextMode(mode)
    setSelectedId(
      mode === 'political'
        ? politicalOperators[0]?.id ?? ''
        : enterpriseOperators[0]?.id ?? '',
    )
  }

  const handleAddCustomOperator = () => {
    const cleanName = newName.trim()
    if (!cleanName) return
    const op: EnrichedShadowOperator = {
      id: `ent_custom_${Date.now().toString(36)}`,
      name: cleanName,
      role: newRole.trim() || 'Gatekeeper Propio',
      categoryLabel: 'Operador Propio',
      categoryIcon: '🧩',
      note:
        newNote.trim() ||
        'Actor informal incorporado por el usuario con influencia directa sobre decisiones clave.',
      vetoPower: newVeto,
      decisionAccess: newAccess,
      agendaControl: 65,
      ruptureRisk: Math.round((newVeto + newAccess) / 2.2),
      incentiveDriver: 'Proteger autonomía, estatus o margen dentro de la organización.',
      neutralizeTactic:
        'Documentar procesos, crear canales redundantes y limitar puntos únicos de fallo.',
      alignTactic:
        'Alinear incentivos tempranos e integrarlo en acuerdos de piloto reversible (Tipo 2).',
      isCustom: true,
    }
    const next = [op, ...customOps]
    setCustomOps(next)
    try {
      localStorage.setItem(CUSTOM_SHADOW_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
    setNewName('')
    setNewNote('')
    setShowAddForm(false)
    setContextMode('enterprise')
    setSelectedId(op.id)
  }

  const handleDeleteCustom = (id: string) => {
    const next = customOps.filter((o) => o.id !== id)
    setCustomOps(next)
    try {
      localStorage.setItem(CUSTOM_SHADOW_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-6">
      {/* Header + Selector de Contexto */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
            Módulo 11 · Shadow Power &amp; Gatekeepers
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Mapeo de Operadores Informales &amp; Gatekeepers
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Quien no figura en el organigrama suele tener poder real de veto. Analizá acceso al decisor, riesgo de ruptura y tácticas Maquiavelo / Sun Bin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSwitchMode('political')}
            className={cn(
              'px-3 h-8 rounded-md border text-xs font-display font-semibold transition-all cursor-pointer',
              contextMode === 'political'
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            🇦🇷 Poder Informal Político
          </button>
          <button
            onClick={() => handleSwitchMode('enterprise')}
            className={cn(
              'px-3 h-8 rounded-md border text-xs font-display font-semibold transition-all cursor-pointer',
              contextMode === 'enterprise'
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            🏢 Poder Informal en Empresas
          </button>
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="px-3 h-8 rounded-md border border-primary/50 bg-primary/10 text-primary text-xs font-display font-semibold hover:bg-primary/20 cursor-pointer"
          >
            {showAddForm ? '✕ Cerrar' : '➕ Agregar Operador Propio'}
          </button>
        </div>
      </div>

      {/* Formulario Operador Propio */}
      {showAddForm && (
        <div className="bg-card border border-primary/40 rounded-lg p-5 space-y-3">
          <div className="text-[10px] font-display uppercase tracking-wider text-primary font-bold">
            Agregar Gatekeeper u Operador Informal de tu Empresa
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Nombre / Rol clave
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Jefe de Compras, Asesor Impositivo..."
                className="w-full bg-background border border-border rounded px-3 h-8 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Área o Palanca
              </label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 h-8 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Poder de Veto Oculto: {newVeto}%
              </label>
              <input
                type="range"
                min={20}
                max={99}
                value={newVeto}
                onChange={(e) => setNewVeto(Number(e.target.value))}
                className="w-full accent-primary mt-1.5"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Acceso al Decisor: {newAccess}%
              </label>
              <input
                type="range"
                min={20}
                max={99}
                value={newAccess}
                onChange={(e) => setNewAccess(Number(e.target.value))}
                className="w-full accent-primary mt-1.5"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            <div className="flex-1">
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Cómo opera / Dónde puede bloquear
              </label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ej: Controla la firma de excepciones comerciales o acceso al ERP..."
                className="w-full bg-background border border-border rounded px-3 h-8 text-xs outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleAddCustomOperator}
              disabled={!newName.trim()}
              className="px-4 h-8 rounded bg-primary text-primary-foreground text-xs font-display font-semibold hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
            >
              + Guardar Operador
            </button>
          </div>
        </div>
      )}

      {/* Layout Lista + Panel Diagnóstico Maquiavelo / Sun Bin */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          {contextMode === 'political' ? (
            SECTIONS.map((section) => {
              const items = politicalOperators.filter((o) =>
                SHADOW_ACTORS[section.key].some((raw) => raw.name === o.name),
              )
              return (
                <div key={section.key} className="space-y-3">
                  <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {section.icon} {section.label}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {items.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedId(a.id)}
                        className={cn(
                          'text-left bg-card border rounded-lg p-4 space-y-2.5 transition-all cursor-pointer',
                          selectedOperator?.id === a.id
                            ? 'border-primary ring-1 ring-primary/40'
                            : 'border-border hover:border-primary/40',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-bold text-primary">
                            {a.name}
                          </span>
                          <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">
                            {a.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{a.note}</p>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[10px] font-display">
                          <div>
                            <span className="text-muted-foreground">Veto oculto: </span>
                            <span className="text-foreground font-bold">{a.vetoPower}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Acceso decisor: </span>
                            <span className="text-foreground font-bold">{a.decisionAccess}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Agenda: </span>
                            <span className="text-foreground font-bold">{a.agendaControl}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Riesgo ruptura: </span>
                            <span
                              className={cn(
                                'font-bold',
                                a.ruptureRisk >= 65 ? 'text-signal-rival' : 'text-amber-400',
                              )}
                            >
                              {a.ruptureRisk}%
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {enterpriseOperators.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    'text-left bg-card border rounded-lg p-4 space-y-2.5 transition-all cursor-pointer',
                    selectedOperator?.id === a.id
                      ? 'border-primary ring-1 ring-primary/40'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span>{a.categoryIcon}</span>
                      <span className="font-display text-sm font-bold text-primary">
                        {a.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">
                        {a.role}
                      </span>
                      {a.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCustom(a.id)
                          }}
                          className="text-[10px] text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Eliminar operador"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.note}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[10px] font-display">
                    <div>
                      <span className="text-muted-foreground">Veto oculto: </span>
                      <span className="text-foreground font-bold">{a.vetoPower}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Acceso decisor: </span>
                      <span className="text-foreground font-bold">{a.decisionAccess}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Agenda: </span>
                      <span className="text-foreground font-bold">{a.agendaControl}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Riesgo ruptura: </span>
                      <span
                        className={cn(
                          'font-bold',
                          a.ruptureRisk >= 65 ? 'text-signal-rival' : 'text-amber-400',
                        )}
                      >
                        {a.ruptureRisk}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel Diagnóstico Maquiavelo / Sun Bin */}
        {selectedOperator && (
          <div className="bg-card border border-primary/40 rounded-lg p-5 space-y-4 sticky top-6">
            <div>
              <div className="text-[10px] font-display uppercase tracking-wider text-primary font-bold">
                Diagnóstico Maquiavelo / Sun Bin · Palancas Informales
              </div>
              <h3 className="font-display text-lg font-bold mt-1">
                {selectedOperator.categoryIcon} {selectedOperator.name}
              </h3>
              <div className="text-xs text-muted-foreground font-display">
                {selectedOperator.role} · {selectedOperator.categoryLabel}
              </div>
            </div>

            <div className="space-y-2.5 bg-background/60 border border-border/60 rounded-md p-3.5">
              {(
                [
                  { label: 'Capacidad de Veto Oculto', val: selectedOperator.vetoPower, color: 'bg-signal-rival' },
                  { label: 'Acceso al Decisor', val: selectedOperator.decisionAccess, color: 'bg-primary' },
                  { label: 'Influencia en Agenda', val: selectedOperator.agendaControl, color: 'bg-amber-400' },
                  { label: 'Riesgo de Ruptura', val: selectedOperator.ruptureRisk, color: 'bg-chart-3' },
                ] as const
              ).map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[11px] font-display mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-bold">{m.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', m.color)}
                      style={{ width: `${m.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded bg-background/60 border border-border/50">
                <div className="text-[10px] font-display uppercase text-primary font-bold mb-1">
                  Incentivo Real / Motivación Oculta
                </div>
                <p className="text-foreground">{selectedOperator.incentiveDriver}</p>
              </div>
              <div className="p-3 rounded bg-background/60 border border-amber-400/30">
                <div className="text-[10px] font-display uppercase text-amber-400 font-bold mb-1">
                  Cómo Neutralizar un Bloqueo
                </div>
                <p className="text-foreground">{selectedOperator.neutralizeTactic}</p>
              </div>
              <div className="p-3 rounded bg-background/60 border border-signal-ally/30">
                <div className="text-[10px] font-display uppercase text-signal-ally font-bold mb-1">
                  Cómo Alinear Incentivos (Ganar-Ganar)
                </div>
                <p className="text-foreground">{selectedOperator.alignTactic}</p>
              </div>
            </div>

            <Link
              to={
                contextMode === 'political'
                  ? '/decisiones?level=L4_MACRO'
                  : '/decisiones?level=L3_EMPRESA'
              }
              className="w-full h-9 rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              ⚡ Modelar Contraparte en Motor de Decisiones →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
