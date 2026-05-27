import { reactive } from 'vue'

const state = reactive({
  user: JSON.parse(localStorage.getItem('fashion_user') || 'null'),
  isLoggedIn: !!localStorage.getItem('fashion_user')
})

export function useUser() {
  function setUser(user) {
    state.user = user
    state.isLoggedIn = true
    localStorage.setItem('fashion_user', JSON.stringify(user))
  }

  function logout() {
    state.user = null
    state.isLoggedIn = false
    localStorage.removeItem('fashion_user')
  }

  return { state, setUser, logout }
}
