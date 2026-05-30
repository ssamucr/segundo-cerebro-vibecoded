import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Inyecta el JWT de Clerk en cada request
api.interceptors.request.use(async (config) => {
  // getToken se inyecta desde el componente raíz vía setTokenGetter
  const token = await tokenGetter?.()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type TokenGetter = () => Promise<string | null>
let tokenGetter: TokenGetter | null = null

export function setTokenGetter(fn: TokenGetter) {
  tokenGetter = fn
}

export default api
