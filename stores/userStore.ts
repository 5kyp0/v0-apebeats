import { create } from "zustand"

type UserState = {
  email: string | null
  setEmail: (email: string | null) => void
}

const useUserStore = create<UserState>((set) => ({
  email: null,
  setEmail: (email) => set({ email }),
}))

export default useUserStore


