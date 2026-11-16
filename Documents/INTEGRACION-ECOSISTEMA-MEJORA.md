# Especificación del Contrato de Federación — MejoraDecisiones OS v1

> **Versión del Esquema:** `mejora.decision-os.v1`  
> **Estado:** Production-Ready (`v6.0.0`)  
> **Alcance:** Integración bidireccional y desacoplada entre **MejoraDecisiones OS** y el ecosistema **Mejora** (incluyendo **Diagnóstico 4D Empresarial** y futuras aplicaciones).

---

## 1. Principios de Diseño de la Federación

1. **Autonomía Operativa 100%:** MejoraDecisiones funciona de manera completa, reactiva e individual sin requerir backend propietario, servidores de federación ni dependencias forzosas.
2. **Desacoplamiento Estricto:** La comunicación no requiere compartir memoria interna ni estados de frameworks. Todo intercambio se realiza mediante esquemas de datos serializables JSON con validación en frontera.
3. **Privacidad Zero-Knowledge:** Las credenciales de IA (BYOK) y los datos sensibles se mantienen en el almacenamiento del cliente (`localStorage`) y nunca se exportan en los paquetes federados ni se transmiten por `postMessage`.

---

## 2. Canales de Integración Soportados

MejoraDecisiones OS expone cuatro canales de integración complementarios:

```
┌────────────────────────────────────────────────────────┐
│                   ECOSISTEMA MEJORA                    │
│   (Diagnóstico 4D / MejoraApp / Portales de Clientes)  │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[Canal 1: window API]  [Canal 2: postMessage] [Canal 3: Deep Links]
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                 MEJORA DECISIONES OS                   │
│   (Motor de Incertidumbre, Monte Carlo, Árboles, etc.) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼ [Canal 4: Return Link]
   https://diagnostico.mejoraok.com?utm_source=...&sector=...
```

### Canal 1: API Global JavaScript (`window.MejoraDecisionOS`)

Cuando la aplicación corre en un navegador (o embebida en un WebView o iframe), registra en `window` el objeto:

```typescript
declare global {
  interface Window {
    MejoraDecisionOS?: {
      version: string // 'mejora.decision-os.v1'
      exportBundle: () => FederationPayload
      importBundle: (payload: unknown) => boolean
      getEnterpriseProfile: () => EnterpriseExposureProfile
      setEnterpriseProfile: (profile: EnterpriseExposureProfile) => void
      getJournal: () => DecisionJournalEntry[]
    }
  }
}
```

### Canal 2: Protocolo de Mensajería Bidireccional (`postMessage`)

Para integración segura dentro de `<iframe>` o micro-frontends:

#### Mensajes Entrantes al OS (`window.addEventListener('message')`)
El mensaje debe incluir `target: 'MejoraDecisionesOS'` y `type: 'MEJORA_FEDERATION_CMD'`:

1. **Comando `PING`:**
   ```json
   {
     "target": "MejoraDecisionesOS",
     "type": "MEJORA_FEDERATION_CMD",
     "action": "PING"
   }
   ```
   *Respuesta emitida:* Evento DOM `mejora:federation-pong` y `postMessage` con el bundle exportado completo.

2. **Comando `IMPORT_BUNDLE`:**
   ```json
   {
     "target": "MejoraDecisionesOS",
     "type": "MEJORA_FEDERATION_CMD",
     "action": "IMPORT_BUNDLE",
     "payload": { ... } // Esquema FederationPayload validado
   }
   ```

3. **Comando `SET_ENTERPRISE_PROFILE`:**
   ```json
   {
     "target": "MejoraDecisionesOS",
     "type": "MEJORA_FEDERATION_CMD",
     "action": "SET_ENTERPRISE_PROFILE",
     "profile": {
       "companyName": "Acme Corp",
       "sector": "servicios",
       "region": "AR",
       "revenueExportPct": 40,
       "costDollarizedPct": 30,
       "debtExposurePct": 15,
       "laborIntensityPct": 35,
       "cashRunwayMonths": 8
     }
   }
   ```

#### Eventos Salientes desde el OS
- `mejora:bundle-imported`: Disparado tras importar un paquete validado.
- `mejora:region-changed`: Disparado al cambiar de región en vivo (`AR`, `US`, `BR`, `MX`, `EU`, `GLOBAL`).
- `mejora:decision-committed`: Disparado al registrar una decisión en la bitácora auditable.

---

### Canal 3: Enlaces Profundos URL (*Deep Links*)

Cualquier módulo o sistema externo puede abrir `/decisiones` precargando un problema puntual:

```
https://pabloeckert.github.io/MejoraDecisiones/#/decisiones?level=L3_EMPRESA&region=AR&title=Ajuste%20de%20Precios&optA=Subir%2015%25&optB=Mantener%20Margen&optC=Descuento%20por%20Volumen
```

Parámetros soportados:
- `level`: `L4_MACRO` | `L3_EMPRESA` | `L2_PERSONAL` | `L1_COTIDIANO`
- `region`: `GLOBAL` | `AR` | `US` | `BR` | `MX` | `EU`
- `title`: Título o dilema bajo análisis (sanitizado automáticamente)
- `optA`, `optB`, `optC`: Tres alternativas iniciales a precargar en las matrices

---

### Canal 4: Retorno Enriquecido al Diagnóstico 4D

Desde los banners de cabecera y el pie de la bitácora, MejoraDecisiones OS genera enlaces enriquecidos hacia Diagnóstico 4D:

```
https://diagnostico.mejoraok.com?utm_source=mejora_decisiones_os&utm_medium=decision_journal&region=AR&sector=servicios&export_pct=25&usd_cost_pct=35
```

---

## 3. Esquema de Datos Canónico (`FederationPayload`)

```typescript
export interface FederationPayload {
  schemaVersion: 'mejora.decision-os.v1'
  exportedAt: string // ISO 8601 UTC
  activeRegion: 'GLOBAL' | 'AR' | 'US' | 'BR' | 'MX' | 'EU'
  enterpriseProfile: {
    companyName: string
    sector: 'manufactura' | 'comercio' | 'servicios' | 'agro' | 'construccion' | 'tecnologia'
    region: 'GLOBAL' | 'AR' | 'US' | 'BR' | 'MX' | 'EU'
    revenueExportPct: number // 0..100
    costDollarizedPct: number // 0..100
    debtExposurePct: number // 0..100
    laborIntensityPct: number // 0..100
    cashRunwayMonths: number // 0..120
    diagnostico4DId?: string
  }
  journal: Array<{
    id: string
    createdAt: string
    level: 'L4_MACRO' | 'L3_EMPRESA' | 'L2_PERSONAL' | 'L1_COTIDIANO'
    region: 'GLOBAL' | 'AR' | 'US' | 'BR' | 'MX' | 'EU'
    title: string
    chosenAlternative: string
    consensusAlternative: string
    minimaxRegretAlternative: string
    expectedValue: number
    maxRegret: number
    confidencePct: number // 0..100
    reversibility: 'reversible' | 'partially_reversible' | 'irreversible'
    notes: string
    outcomeStatus: 'pending' | 'success' | 'partial' | 'failed'
    actualOutcomeScore?: number
    reviewDueAt?: string // ISO 8601 UTC
  }>
}
```

---

## 4. Validación de Fronteras y Seguridad

La función `validateFederationBundle(payload: unknown)` aplica verificaciones estrictas:
- **Versión de esquema exacta:** Rechaza payloads sin `schemaVersion: "mejora.decision-os.v1"`.
- **Límites numéricos rígidos:** Verifica que porcentajes estén dentro del rango $[0, 100]$ y meses de caja dentro de $[0, 120]$.
- **Sanitización de cadenas:** Limpia caracteres `<` y `>` para neutralizar inyecciones de código o ataques XSS en notas y títulos de decisiones.
- **Tolerancia a fallos:** Si un payload contiene campos optativos faltantes, aplica valores predeterminados seguros sin interrumpir la ejecución.
