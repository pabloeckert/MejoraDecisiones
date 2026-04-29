import { describe, it, expect } from 'vitest'
import { ACTORS, RELATIONS, ACTOR_KIND_LABELS } from '../lib/seed-data'
import { AI_THINKING } from '../lib/data/ai-thinking'
import { ANALYSTS_NATIONAL, ANALYSTS_INTL } from '../lib/data/analysts'
import { CONGRESS } from '../lib/data/congress'
import { PROVINCES } from '../lib/data/provinces'
import { SHADOW_ACTORS } from '../lib/data/shadow'
import { INTL_BLOCS } from '../lib/data/international'
import { ALLIANCES } from '../lib/data/alliances'
import { SCENARIOS } from '../lib/data/scenarios'
import { FEED_ITEMS } from '../lib/data/feed'
import { KANBAN_CARDS } from '../lib/data/kanban'
import { PYMES_DIAGNOSIS, PYMES_INDICATORS } from '../lib/data/pymes'
import { ORGS_NATIONAL, ORGS_INTL } from '../lib/data/organisms'

describe('Seed Data — Actors', () => {
  it('has at least 25 actors', () => {
    expect(ACTORS.length).toBeGreaterThanOrEqual(25)
  })

  it('all actors have required fields', () => {
    ACTORS.forEach((a) => {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.kind).toBeTruthy()
      expect(a.ideology).toBeGreaterThanOrEqual(-1)
      expect(a.ideology).toBeLessThanOrEqual(1)
      expect(a.power).toBeGreaterThanOrEqual(0)
      expect(a.power).toBeLessThanOrEqual(1)
    })
  })

  it('all actor kinds are valid', () => {
    const validKinds = Object.keys(ACTOR_KIND_LABELS)
    ACTORS.forEach((a) => {
      expect(validKinds).toContain(a.kind)
    })
  })

  it('no duplicate actor IDs', () => {
    const ids = ACTORS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('Seed Data — Relations', () => {
  it('has at least 30 relations', () => {
    expect(RELATIONS.length).toBeGreaterThanOrEqual(30)
  })

  it('all relations reference valid actors', () => {
    const actorIds = new Set(ACTORS.map((a) => a.id))
    RELATIONS.forEach((r) => {
      expect(actorIds).toContain(r.source)
      expect(actorIds).toContain(r.target)
    })
  })

  it('all relation types are valid', () => {
    RELATIONS.forEach((r) => {
      expect(['ally', 'rival', 'neutral']).toContain(r.type)
    })
  })

  it('strength is between 0 and 1', () => {
    RELATIONS.forEach((r) => {
      expect(r.strength).toBeGreaterThanOrEqual(0)
      expect(r.strength).toBeLessThanOrEqual(1)
    })
  })
})

describe('AI Thinking', () => {
  it('has at least 4 models', () => {
    expect(AI_THINKING.length).toBeGreaterThanOrEqual(4)
  })

  it('all entries have source, text, confidence', () => {
    AI_THINKING.forEach((t) => {
      expect(t.source).toBeTruthy()
      expect(t.text).toBeTruthy()
      expect(t.confidence).toBeTruthy()
    })
  })
})

describe('Analysts', () => {
  it('has national analysts', () => {
    expect(ANALYSTS_NATIONAL.length).toBeGreaterThanOrEqual(3)
  })

  it('has international analysts', () => {
    expect(ANALYSTS_INTL.length).toBeGreaterThanOrEqual(2)
  })

  it('all analysts have valid stance', () => {
    [...ANALYSTS_NATIONAL, ...ANALYSTS_INTL].forEach((a) => {
      expect(['bullish', 'bearish', 'neutral']).toContain(a.stance)
    })
  })
})

describe('Congress', () => {
  it('has diputados blocks', () => {
    expect(CONGRESS.diputados.blocks.length).toBeGreaterThanOrEqual(3)
  })

  it('has senado blocks', () => {
    expect(CONGRESS.senado.blocks.length).toBeGreaterThanOrEqual(3)
  })

  it('has agenda items', () => {
    expect(CONGRESS.agenda.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Provinces', () => {
  it('has 23 provinces + CABA', () => {
    expect(PROVINCES.length).toBeGreaterThanOrEqual(23)
  })

  it('all provinces have required fields', () => {
    PROVINCES.forEach((p) => {
      expect(p.name).toBeTruthy()
      expect(p.gov).toBeTruthy()
      expect(p.party).toBeTruthy()
      expect(['allied', 'hostile', 'neutral']).toContain(p.align)
    })
  })
})

describe('Shadow Actors', () => {
  it('has judicial actors', () => {
    expect(SHADOW_ACTORS.judicial.length).toBeGreaterThanOrEqual(2)
  })

  it('has digital actors', () => {
    expect(SHADOW_ACTORS.digital.length).toBeGreaterThanOrEqual(1)
  })

  it('has economic actors', () => {
    expect(SHADOW_ACTORS.economic.length).toBeGreaterThanOrEqual(1)
  })
})

describe('International', () => {
  it('has at least 5 blocs', () => {
    expect(INTL_BLOCS.length).toBeGreaterThanOrEqual(5)
  })

  it('all blocs have required fields', () => {
    INTL_BLOCS.forEach((b) => {
      expect(b.flag).toBeTruthy()
      expect(b.name).toBeTruthy()
      expect(b.status).toBeTruthy()
      expect(b.body).toBeTruthy()
    })
  })
})

describe('Alliances', () => {
  it('has solid alliances', () => {
    expect(ALLIANCES.solid.length).toBeGreaterThanOrEqual(2)
  })

  it('has weak alliances', () => {
    expect(ALLIANCES.weak.length).toBeGreaterThanOrEqual(1)
  })

  it('has broken alliances', () => {
    expect(ALLIANCES.broken.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Scenarios', () => {
  it('has at least 4 scenarios', () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(4)
  })

  it('probabilities roughly sum to ~100', () => {
    const total = SCENARIOS.reduce((s, sc) => s + sc.pct, 0)
    expect(total).toBeGreaterThan(80)
    expect(total).toBeLessThan(120)
  })
})

describe('Feed', () => {
  it('has at least 5 items', () => {
    expect(FEED_ITEMS.length).toBeGreaterThanOrEqual(5)
  })
})

describe('Kanban', () => {
  it('has at least 5 cards', () => {
    expect(KANBAN_CARDS.length).toBeGreaterThanOrEqual(5)
  })

  it('all cards have valid columns', () => {
    KANBAN_CARDS.forEach((c) => {
      expect(['emerging', 'active', 'dominant', 'collapsed']).toContain(c.col)
    })
  })
})

describe('PyMEs', () => {
  it('has diagnosis sectors', () => {
    expect(PYMES_DIAGNOSIS.length).toBeGreaterThanOrEqual(3)
  })

  it('has indicators', () => {
    expect(PYMES_INDICATORS.length).toBeGreaterThanOrEqual(3)
  })
})

describe('Organisms', () => {
  it('has national organisms', () => {
    expect(ORGS_NATIONAL.length).toBeGreaterThanOrEqual(3)
  })

  it('has international organisms', () => {
    expect(ORGS_INTL.length).toBeGreaterThanOrEqual(2)
  })
})
