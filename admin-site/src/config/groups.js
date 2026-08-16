export const GROUPS = Array.from({ length: 6 }, (_, index) => {
  const number = index + 1
  const primaryEmail = `group${number}@english-tracker.local`
  return {
    id: `Gr${number}`,
    name: `Group Gr${number}`,
    accountEmail: primaryEmail,
    accountEmails: [
      primaryEmail,
      ...Array.from({ length: 8 }, (_, resetIndex) => `group${number}-access${resetIndex + 2}@english-tracker.local`),
    ],
  }
})

export function getGroup(groupId) {
  return GROUPS.find((group) => group.id === groupId) || GROUPS[0]
}
