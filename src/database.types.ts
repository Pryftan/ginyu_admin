export interface Player {
    id: number
    name: string
    characters: Array<number>
}

export interface Event {
    id: number
    name: string
    date: Date
    participants: [number]
}

export interface RawScore {
    id: number
    event: number
    match: number
    player: number
    character?: number
    score: number
}

export interface Character {
    id: number
    name: string
}

export interface Database {
    public: {
      Tables: {
        players: {
            Row: Player
        }
        events: {
            Row: Event
            Insert: { 
                id?: never
                name: string
                date: Date
                participants: [number]
            }
            Update: {
                id?: never
                name?: string
                date?: Date
                participants?: [number]
            }
        }
        characters: {
            Row: Character
        }
        scores: {
            Row: RawScore
            Insert: {
                id?: never
                event: number
                match: number
                name: number
                character?: number
                score: number
            }
            Update: {
                id?: never
                event?: number
                match?: number
                name?: number
                character?: number
                score?: number
            }
        }
      }
    }
  }