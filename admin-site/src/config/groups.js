export const GROUPS = Array.from({ length: 6 }, (_, index) => {
  const number = index + 1
  return {
    id: `Gr${number}`,
    name: `Group Gr${number}`,
    accountEmail: `group${number}@english-tracker.local`,
  }
})

export function getGroup(groupId) {
  return GROUPS.find((group) => group.id === groupId) || GROUPS[0]
}
