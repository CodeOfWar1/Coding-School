import {
  FaBrain,
  FaBuilding,
  FaCalendarAlt,
  FaCode,
  FaCogs,
  FaGamepad,
  FaLaptopCode,
  FaPuzzlePiece,
  FaRobot,
  FaRocket,
  FaShieldAlt,
  FaTerminal,
  FaUsers,
} from 'react-icons/fa'
import { WHY_CHOOSE_ANVIL, OVERVIEW_FACTS } from '../../content/siteProfile'

export const COURSE_CARD_ICONS = [
  FaLaptopCode,
  FaPuzzlePiece,
  FaGamepad,
  FaRobot,
  FaCogs,
  FaCode,
  FaTerminal,
  FaRocket,
  FaShieldAlt,
  FaBrain,
]

export const WHY_FAMILY_ITEMS = [
  ...WHY_CHOOSE_ANVIL,
  'Strong emphasis on online community engagement for continued learning and mentorship.',
]

export const GLANCE_STATS = [
  { label: 'Founded', value: OVERVIEW_FACTS.foundedWhere, Icon: FaCalendarAlt },
  { label: 'Audience', value: OVERVIEW_FACTS.audience, Icon: FaUsers },
  { label: 'Facility', value: OVERVIEW_FACTS.facilitySqFt, Icon: FaBuilding },
]
