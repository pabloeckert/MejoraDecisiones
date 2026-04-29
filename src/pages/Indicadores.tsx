import { useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const MACRO_DATA = [
  { mes: 'Oct-25', inflacion: 2.7, pib: 3.8, reservas: 32, riesgo: 850 },
  { mes: 'Nov-25', inflacion: 2.6, pib: 3.9, reservas: 33, riesgo: 800 },
  { mes: 'Dic-25', inflacion: 2.5, pib: 4.0, reservas: 34, riesgo: 750 },
  { mes: 'Ene-26', inflacion: 2.4, pib: 3.9, reservas: 34, riesgo: 720 },
  { mes: 'Feb-26', inflacion: 2.3, pib: 3.7, reservas: 35, riesgo: 680 },
  { mes: 'Mar-26', inflacion: 3.4, pib: 3.5, reservas: 35, riesgo: 650 },
]

const POLITICAL_KPIS = [
  { label: 'Aprobación presidencial', value: '42%', change: '-3pp', trend: 'down', source: 'Poliarquía' },
  { label: 'Imagen positiva LLA', value: '40%', change: '-2pp', trend: 'down', source: 'Poliarquía' },
  { label: 'Intención de voto LLA', value: '38%', change: '+1pp', trend: 'up', source: 'Synopsis' },
  { label: 'Confianza consumidor', value: '48.2', change: '+2.1', trend: 'up', source: 'UTDT' },
]

const ECON_KPIS = [
  { label: 'Inflación mensual', value: '3.4%', change: '+1.1pp', trend: 'down', source: 'INDEC' },
  { label: 'PIB interanual', value: '+3.5%', change: '-0.5pp', trend: 'down', source: 'INDEC' },
  { label: 'Reservas BCRA', value: 'USD 35B', change: '+1B', trend: 'up', source: 'BCRA' },
  { label: 'Riesgo país', value: '650 bps', change: '-30', trend: 'up', source: 'JPM' },
  { label: 'Pobreza', value: '31.6%', change: '-2.4pp', trend: 'up', source: 'INDEC' },
  { label: 'Desempleo', value: '6.8%', change: '-0.5pp', trend: 'up', source: 'INDEC' },
  { label: 'Tipo de cambio', value: '$1,450', change: '+$50', trend: 'down', source: 'BCRA' },
  { label: 'Superávit fiscal', value: '0.8% PIB', change: '+0.2pp', trend: 'up', source: 'MECON' },
]

const SECTOR_DATA = [
  { sector: 'Industria', variacion: -2.3, empleo: -1.5 },
  { sector: 'Construcción', variacion: -4.1, empleo: -3.2 },
  { sector: 'Comercio', variacion: -1.8, empleo: -0.9 },
  { sector: 'Servicios', variacion: 1.2, empleo: 0.8 },
  { sector: 'Agro', variacion: 3.5, empleo: 1.1 },
  { sector: 'Tecnología', variacion: 5.2, empleo: 3.8 },
  { sector: 'Minería', variacion: 8.1, empleo: 2.5 },
  { sector: 'Energía', variacion: 6.4, empleo: 1.9 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-card border border-border rounded-md p-3 text-xs font-display shadow-lg">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span>{p.dataKey}: <span className="text-foreground">{p.value}</span></span>
        </div>
      ))}
    </div>
  )
}

export default function IndicadoresPage() {
  const [activeTab, setActiveTab] = useState<'macro' | 'politico' | 'sectores'>('macro')

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-display text-[9px] text-primary/50 font-bold tracking-wider">04</span>
        <div className="h-px w-8 bg-primary/20" />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Indicadores</h1>
      <p className="text-muted-foreground text-xs mt-1">KPIs políticos y económicos con evolución temporal.</p>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        {([
          { key: 'macro', label: 'Macro' },
          { key: 'politico', label: 'Político' },
          { key: 'sectores', label: 'Sectores' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 h-7 rounded-md border text-[10px] font-display transition-all ${
              activeTab === tab.key
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'macro' && (
        <div className="mt-8 space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ECON_KPIS.map((kpi, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{kpi.label}</div>
                <div className="font-display text-2xl mt-1">{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-display ${kpi.trend === 'up' ? 'text-signal-ally' : 'text-signal-rival'}`}>
                    {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{kpi.source}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Inflation chart */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-4">Inflación mensual (%)</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MACRO_DATA}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="inflacion" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reserves chart */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-4">Reservas BCRA (MM USD)</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MACRO_DATA}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="reservas" stroke="var(--signal-ally)" fill="var(--signal-ally)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk chart */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-4">Riesgo país (bps)</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MACRO_DATA}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="riesgo" stroke="var(--signal-rival)" fill="var(--signal-rival)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'politico' && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POLITICAL_KPIS.map((kpi, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{kpi.label}</div>
                <div className="font-display text-2xl mt-1">{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-display ${kpi.trend === 'up' ? 'text-signal-ally' : 'text-signal-rival'}`}>
                    {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{kpi.source}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-3">Contexto político</div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• <strong className="text-foreground">Oficialismo:</strong> LLA mantiene 40%+ de imagen positiva pero núcleo duro más estrecho. La interna Karina-Caputo es el factor de mayor incertidumbre.</p>
              <p>• <strong className="text-foreground">Oposición:</strong> UxP fragmentada entre dialoguistas y duros. CFK mantiene influencia pero sin cargo formal.</p>
              <p>• <strong className="text-foreground">Bisagra:</strong> Provincias Unidas (Llaryora-Pullaro-Torres) emerge como tercer polo legislativo.</p>
              <p>• <strong className="text-foreground">Congreso:</strong> LLA es primera minoría en Diputados (~130 bancas). Necesita aliados para quórum y votaciones clave.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sectores' && (
        <div className="mt-8 space-y-6">
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-4">Variación sectorial (%)</div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SECTOR_DATA} layout="vertical">
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="sector" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="variacion" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="empleo" fill="var(--signal-ally)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-4 text-xs font-display text-muted-foreground">
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /> Variación PIB</span>
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-signal-ally" /> Variación empleo</span>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-3">Lectura sectorial</div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong className="text-foreground">Mining & Energy:</strong> Vaca Muerta y litio lideran el crecimiento. Inversión extranjera récord.</p>
              <p>• <strong className="text-foreground">Tecnología:</strong> Exportaciones de software siguen creciendo. Demanda de talento estable.</p>
              <p>• <strong className="text-foreground">Construcción:</strong> El sector más golpeado por el ajuste. Caída de obra pública.</p>
              <p>• <strong className="text-foreground">Industria:</strong> Ajuste + apertura importadora = presión sobre manufactura local.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
