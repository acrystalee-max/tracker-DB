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

export function getRequestedGroup() {
  const requested = new URLSearchParams(window.location.search).get('group')
  return GROUPS.find((group) => group.id === requested) || GROUPS[0]
}
