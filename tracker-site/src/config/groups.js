export const GROUPS = Array.from({ length: 6 }, (_, index) => {
  const number = index + 1
  return {
    id: `Gr${number}`,
    name: `Group Gr${number}`,
    accountEmail: `group${number}@english-tracker.local`,
  }
})

export function getRequestedGroup() {
  const requested = new URLSearchParams(window.location.search).get('group')
  return GROUPS.find((group) => group.id === requested) || GROUPS[0]
}
