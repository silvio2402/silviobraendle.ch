export interface AppDetails {
  title: string
  description: string
  img?: string
}

export interface App {
  App: () => JSX.Element
  details: AppDetails
  id: string
  lang?: string
}

const apps: Array<App> = [
]

export default apps
