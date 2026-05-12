/** Partner logos shown on the home partners strip and on `/partners`. */
export const LANDING_PARTNER_LOGOS = [
  { name: 'Best Buddies Academy', file: 'Best_Buddies_Academy.png' },
  { name: 'Pestalozzi Academy', file: 'pestalozzi Academy.jpeg' },
  { name: 'Rose Garden School', file: 'Rose_Garden_School.png' },
  { name: 'TLL Academy and Learning Ladder', file: 'TLL_Academy_and_Learning_Ladder.png' },
]

export const LANDING_PARTNERS_INTRO =
  'We collaborate with mission-driven institutions to expand access to world-class digital learning.'

export function landingPartnerLogoSrc(file) {
  return `/media/partner logos/${file}`
}
