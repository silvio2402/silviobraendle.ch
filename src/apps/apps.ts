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
      title: 'Counter',
      description: 'Straightforward counter application for testing purposes.',
    },
    id: 'counter',
  },
]

export const getApp = (id: string) => apps.find((app) => app.id === id)

export default apps
