export interface AppDetails {
  title: string
  description: string
  img?: string
}
export interface App {
  details: AppDetails
  id: string
  lang?: string
}

export const apps: Array<App> = [
  {
    details: {
      title: 'SudokuSolver',
      description: 'Solve sudoku.',
    },
    id: 'sudoku-solver',
  },
  {
    details: {
      title: 'QR Code Generator',
      description: 'Create QR codes of multiple types easily and quickly.',
    },
    id: 'qr-gen',
  },
  {
    details: {
      title: 'Simon Game',
      description: 'Play the simon game online.',
    },
    id: 'simon-game',
  },
  {
    details: {
      title: 'Stopwatch',
      description: 'Keep track of how long something took with this stopwatch.',
    },
    id: 'stopwatch',
  },
  {
    details: {
      title: 'Counter',
      description: 'Straightforward counter application for testing purposes.',
    },
    id: 'counter',
  },
]

export const getApp = (id: string) => apps.find((app) => app.id === id)

export default apps
