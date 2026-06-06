export interface Kid {
  age: number
}

export interface PlaybillData {
  skipped: boolean
  adults: number
  kids: Kid[]
  funChips: string[]
  funNote: string
  notFunChips: string[]
  notFunNote: string
  foodLoveChips: string[]
  foodAvoidChips: string[]
  foodNote: string
  greatDay: string
  cityAndPractical: string
}

export interface PlayStructureData {
  city: string
  sessionAdults: number
  sessionKids: Kid[]
  mood: 'low-key' | 'middle-ground' | 'high-energy' | 'surprise-me'
  duration: 'few-hours' | 'half-day' | 'full-day'
  transport: string[]
  radius: 'local' | '30min' | '1hour' | 'further'
  lowerCarbon: boolean
  rainProof: boolean
  screenplay: string
  sessionNotes: string
}

export interface WheelOption {
  id: string
  name: string
  emoji: string
  pitch: string
}

export interface Stop {
  id: string
  name: string
  emoji: string
  address: string
  mapsUrl: string
  hours: string
  price: string
  tip: string
  props: string
  isHalfTime: boolean
}

export interface DayPlan {
  title: string
  stops: Stop[]
  halfTime: Stop
}

export interface PlaygroundSave {
  id: string          // Date.now().toString()
  type: 'heart' | 'pin'
  title: string
  emoji: string
  pitch: string
  city: string
  savedAt: number
}
