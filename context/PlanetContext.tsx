'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface PlanetDef {
  id:               string
  label:            string
  symbol:           string
  color:            string
  texture:          string
  scale:            number
  atmColor:         string
  atmOpacity:       number
  roughness:        number
  metalness:        number
  keyColor:         number
  keyIntensity:     number
  keyPos:           [number, number, number]
  fillColor:        number
  fillIntensity:    number
  ambientColor:     number
  ambientIntensity: number
  // ── Skill Solar System ─────────────────────────────
  title:            string
  slogan:           string
  skills:           string[]
}

export const PLANETS: PlanetDef[] = [
  {
    id:'mercury', label:'Mercury', symbol:'☿', color:'#c4b49a',
    texture:'/mercury_image.png', scale:0.80,
    atmColor:'#6b6560', atmOpacity:0.03,
    roughness:0.95, metalness:0.05,
    keyColor:0xffe5cc, keyIntensity:4.5, keyPos:[-4,5,10],
    fillColor:0x221100, fillIntensity:0.12,
    ambientColor:0x080406, ambientIntensity:3.0,
    title:'Mercury — Speed & Optimization',
    slogan:'Small in size. Massive in speed.',
    skills:['Performance Tuning','Code Optimization','Fast Learning','Debugging','Quick Prototyping'],
  },
  {
    id:'venus', label:'Venus', symbol:'♀', color:'#e8c96a',
    texture:'/venus_image.png', scale:0.92,
    atmColor:'#e8c96a', atmOpacity:0.10,
    roughness:0.55, metalness:0.00,
    keyColor:0xfff2aa, keyIntensity:3.8, keyPos:[-4,5,10],
    fillColor:0x443300, fillIntensity:0.30,
    ambientColor:0x1a1000, ambientIntensity:4.0,
    title:'Venus — Design & Elegance',
    slogan:'Elegant on the surface. Engineered underneath.',
    skills:['UI/UX Principles','Responsive Design','Frontend Polish','CSS Animations','User Flow'],
  },
  {
    id:'earth', label:'Earth', symbol:'♁', color:'#4a9eff',
    texture:'/earth_image.png', scale:1.00,
    atmColor:'#4488cc', atmOpacity:0.08,
    roughness:0.75, metalness:0.02,
    keyColor:0xfff8f0, keyIntensity:3.2, keyPos:[-5,6,10],
    fillColor:0x334488, fillIntensity:0.24,
    ambientColor:0x070b16, ambientIntensity:4.5,
    title:'Earth — Full Stack Balance',
    slogan:'Frontend and backend in perfect harmony.',
    skills:['React.js','Spring Boot','REST APIs','Databases','Full Stack Dev'],
  },
  {
    id:'mars', label:'Mars', symbol:'♂', color:'#c1440e',
    texture:'/mars_image.png', scale:0.88,
    atmColor:'#c1440e', atmOpacity:0.05,
    roughness:0.90, metalness:0.00,
    keyColor:0xffe8d8, keyIntensity:2.8, keyPos:[-5,6,10],
    fillColor:0x441100, fillIntensity:0.18,
    ambientColor:0x0d0500, ambientIntensity:3.8,
    title:'Mars — Problem Solving',
    slogan:'Engineered for challenges.',
    skills:['DSA','Algorithms','Competitive Coding','Logical Thinking','Pattern Recognition'],
  },
  {
    id:'jupiter', label:'Jupiter', symbol:'♃', color:'#c88050',
    texture:'/jupiter_image.png', scale:1.50,
    atmColor:'#c88050', atmOpacity:0.07,
    roughness:0.70, metalness:0.00,
    keyColor:0xffeecc, keyIntensity:2.2, keyPos:[-5,6,10],
    fillColor:0x442200, fillIntensity:0.20,
    ambientColor:0x0a0600, ambientIntensity:3.2,
    title:'Jupiter — System Design',
    slogan:'Thinking at planetary scale.',
    skills:['System Architecture','Scalability','Distributed Systems','Load Balancing','High Availability'],
  },
  {
    id:'saturn', label:'Saturn', symbol:'♄', color:'#d4b483',
    texture:'/saturn_image.png', scale:1.32,
    atmColor:'#d4b483', atmOpacity:0.07,
    roughness:0.65, metalness:0.00,
    keyColor:0xffeebb, keyIntensity:2.0, keyPos:[-5,6,10],
    fillColor:0x332200, fillIntensity:0.18,
    ambientColor:0x080600, ambientIntensity:3.0,
    title:'Saturn — Structured Architecture',
    slogan:'Modular by nature.',
    skills:['Microservices','Clean Architecture','Service Communication','Docker','Design Patterns'],
  },
  {
    id:'uranus', label:'Uranus', symbol:'⛢', color:'#7de8e8',
    texture:'/uranus_image.png', scale:1.12,
    atmColor:'#7de8e8', atmOpacity:0.09,
    roughness:0.50, metalness:0.00,
    keyColor:0xccf0ff, keyIntensity:1.8, keyPos:[-5,6,10],
    fillColor:0x003344, fillIntensity:0.20,
    ambientColor:0x020a0c, ambientIntensity:3.0,
    title:'Uranus — Innovation & Exploration',
    slogan:'Exploring the unconventional.',
    skills:['New Technologies','AI Exploration','Modern Dev Tools','Cloud Basics','Experimentation'],
  },
  {
    id:'neptune', label:'Neptune', symbol:'♆', color:'#4466cc',
    texture:'/neptune_image.png', scale:1.10,
    atmColor:'#2255cc', atmOpacity:0.09,
    roughness:0.55, metalness:0.00,
    keyColor:0xaaccff, keyIntensity:1.6, keyPos:[-5,6,10],
    fillColor:0x001144, fillIntensity:0.18,
    ambientColor:0x010408, ambientIntensity:2.8,
    title:'Neptune — Depth & Complexity',
    slogan:'Beyond the surface of code.',
    skills:['Advanced Backend','Security Concepts','Complex Logic','Hibernate','JPA'],
  },
  {
    id:'moon', label:'Moon', symbol:'☽', color:'#9aadcc',
    texture:'/moon_equirect_hq.png', scale:0.85,
    atmColor:'#9aadcc', atmOpacity:0.04,
    roughness:0.88, metalness:0.00,
    keyColor:0xfff6e8, keyIntensity:3.2, keyPos:[-5,6,10],
    fillColor:0x334488, fillIntensity:0.24,
    ambientColor:0x070b16, ambientIntensity:4.5,
    title:'Moon — Foundation & Precision',
    slogan:'Strong foundations reflect lasting impact.',
    skills:['Java','OOP Principles','Data Structures','Algorithms','SQL'],
  },
  {
    id:'sun', label:'Sun', symbol:'☀', color:'#ffaa22',
    texture:'/sun_equirect_hq.png', scale:1.45,
    atmColor:'#ff8800', atmOpacity:0.12,
    roughness:0.10, metalness:0.00,
    keyColor:0xffffff, keyIntensity:5.5, keyPos:[0,0,14],
    fillColor:0xff6600, fillIntensity:1.6,
    ambientColor:0x1a0800, ambientIntensity:4.0,
    title:'Sun — Core Strength',
    slogan:'The energy behind every system.',
    skills:['Spring Boot','Backend Engineering','REST APIs','Java Backend','MySQL', 'Authentication','Authorization','Exception Handling'],
  },
]

interface PlanetCtx {
  current:   PlanetDef
  previous:  PlanetDef | null
  switching: boolean
  select:    (id: string) => void
}
const Ctx = createContext<PlanetCtx>({ current:PLANETS[2], previous:null, switching:false, select:()=>{} })

const TOTAL_SWITCH_MS = 1620

export function PlanetProvider({ children }: { children: ReactNode }) {
  const [current,   setCurrent]   = useState<PlanetDef>(PLANETS[2])   // Moon default
  const [previous,  setPrevious]  = useState<PlanetDef | null>(null)
  const [switching, setSwitching] = useState(false)

  const select = useCallback((id: string) => {
    const next = PLANETS.find(p => p.id === id)
    if (!next || next.id === current.id) return
    setPrevious(current)
    setSwitching(true)
    setCurrent(next)
    setTimeout(() => setSwitching(false), TOTAL_SWITCH_MS)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return <Ctx.Provider value={{ current, previous, switching, select }}>{children}</Ctx.Provider>
}

export const usePlanet = () => useContext(Ctx)