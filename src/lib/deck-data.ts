export interface DeckItem {
  id: string
  name: string
  age: number
  blurb: string
  image: string
}

export const MOCK_DECK: DeckItem[] = [
  {
    id: "1",
    name: "Ada",
    age: 28,
    blurb: "Ships on Fridays. Debugs on Mondays.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
  },
  {
    id: "2",
    name: "Linus",
    age: 34,
    blurb: "Lives in the terminal. Emerges for coffee.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  },
  {
    id: "3",
    name: "Grace",
    age: 31,
    blurb: "Writes compilers. Reads poetry.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
  },
  {
    id: "4",
    name: "Kai",
    age: 27,
    blurb: "Trail runner, tea enthusiast, type-system nerd.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80",
  },
  {
    id: "5",
    name: "Mira",
    age: 29,
    blurb: "Designs with Figma. Argues about kerning.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
  },
  {
    id: "6",
    name: "Hiro",
    age: 32,
    blurb: "Turned a bass guitar into a MIDI controller.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
  },
  {
    id: "7",
    name: "Noa",
    age: 26,
    blurb: "Baker by day, Rust developer by night.",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80",
  },
  {
    id: "8",
    name: "Theo",
    age: 30,
    blurb: "Thinks Emacs is a lifestyle. It is.",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80",
  },
]
