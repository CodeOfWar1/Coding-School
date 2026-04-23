// Use encodeURI so spaces are encoded but filename characters like "&" and parentheses remain resolvable by Vite static serving.
const mediaPath = (fileName) => `/media/school%20img/${encodeURI(fileName)}`
const partnerLogoPath = (fileName) => `/media/partner%20logos/${encodeURI(fileName)}`

export const SCHOOL_MEDIA_IMAGES = {
  hero: mediaPath('Hands-on learning.jpeg'),
  lab: mediaPath('Innovation Hub.jpeg'),
  classA: mediaPath('Digital Literacy.jpeg'),
  classB: mediaPath('Web Development.jpeg'),
  classC: mediaPath('Game Design.jpeg'),
  chooseNextStep: mediaPath('Choose the right next step.jpeg'),
  bookAppointment: mediaPath('Book an appointment1.jpeg'),
  meetTheTeam: mediaPath('meet the team.jpeg'),
  social: mediaPath('Community Outreach.jpeg'),
  projectBased: mediaPath('Project-Based Learning.jpeg'),
  team1: mediaPath('Mentorship.jpeg'),
  team2: mediaPath('Robotics.jpeg'),
  team3: mediaPath('Project-Based Learning.jpeg'),
  testimonial: mediaPath('WhatsApp Image 2026-04-23 at 11.23.12 AM.jpeg'),
}

export const FOOTER_GALLERY_IMAGES = [
  SCHOOL_MEDIA_IMAGES.hero,
  SCHOOL_MEDIA_IMAGES.lab,
  SCHOOL_MEDIA_IMAGES.classA,
  SCHOOL_MEDIA_IMAGES.classB,
  SCHOOL_MEDIA_IMAGES.classC,
  SCHOOL_MEDIA_IMAGES.social,
]

const NAMED_GALLERY_METADATA = {
  'Hands-on learning.jpeg': {
    title: 'Hands-on learning',
    description: 'Students learning by building practical projects and solving real coding tasks.',
  },
  'Mentorship.jpeg': {
    title: 'Mentorship',
    description: 'One-on-one and small-group support from instructors during lessons and projects.',
  },
  'Project-Based Learning.jpeg': {
    title: 'Project-Based Learning',
    description: 'Learners create complete outputs like websites, apps, and prototypes.',
  },
  'Innovation Hub.jpeg': {
    title: 'Innovation Hub',
    description: 'Creative tech space for experiments, collaboration, and idea testing.',
  },
  'Digital Literacy.jpeg': {
    title: 'Digital Literacy',
    description: 'Foundational digital skills, communication tools, and online safety practice.',
  },
  'Visual Programming.jpeg': {
    title: 'Visual Programming',
    description: 'Block-based coding activities that build logic and sequencing confidence.',
  },
  'Python.jpeg': {
    title: 'Python',
    description: 'Python classes focused on core syntax, problem solving, and mini-app projects.',
  },
  'Web Development.jpeg': {
    title: 'Web Development',
    description: 'Front-end learning with HTML, CSS, and JavaScript in practical tasks.',
  },
  'Robotics.jpeg': {
    title: 'Robotics',
    description: 'Hands-on robotics labs where students build and program responsive systems.',
  },
  'Innovation & robotics.jpeg': {
    title: 'Innovation & Robotics',
    description: 'Integrated sessions combining design thinking with robotics implementation.',
  },
  'Game Design.jpeg': {
    title: 'Game Design',
    description: 'Interactive game-creation projects emphasizing creativity and technical skills.',
  },
  'Cybersecurity.jpeg': {
    title: 'Cybersecurity',
    description: 'Awareness training on digital safety, protection, and responsible online behavior.',
  },
  'Artificial Intelligence.jpeg': {
    title: 'Artificial Intelligence',
    description: 'Introductory AI concepts with beginner-friendly experimentation and exploration.',
  },
  'Inclusive Community.jpeg': {
    title: 'Inclusive Community',
    description: 'A supportive environment where all learners collaborate and grow together.',
  },
  'Community Outreach.jpeg': {
    title: 'Community Outreach',
    description: 'School-community engagement programs with families and partner institutions.',
  },
  'Girls Tech Cohort.jpeg': {
    title: 'Girls Tech Cohort',
    description: 'Focused participation programs encouraging girls in technology and innovation.',
  },
  'Classroom Events.jpeg': {
    title: 'Classroom Events',
    description: 'Highlights from showcases, competitions, and collaborative class moments.',
  },
  'Book an appointment1.jpeg': {
    title: 'Book an Appointment',
    description: 'Dedicated consultation and school-visit support for families.',
  },
  'Book an Appointment2.jpeg': {
    title: 'Book an Appointment',
    description: 'Dedicated consultation and school-visit support for families.',
  },
  'Choose the right next step.jpeg': {
    title: 'Choose the right next step',
    description: 'Guided pathways for enrollment, class selection, and appointments.',
  },
}

const ALL_SCHOOL_IMAGE_FILES = [
  "Artificial Intelligence.jpeg",
  "Book an appointment1.jpeg",
  "Book an Appointment2.jpeg",
  "bootcamp.jpeg",
  "bootcamp1.jpeg",
  "bootcamp4.jpeg",
  "Choose the right next step.jpeg",
  "Classroom Events.jpeg",
  "coding.jpeg",
  "community out.jpeg",
  "community out2.jpeg",
  "Community Outreach.jpeg",
  "Cybersecurity.jpeg",
  "demonstration.jpeg",
  "Digital Literacy.jpeg",
  "electronics.jpeg",
  "executive.jpeg",
  "festive.jpeg",
  "Game Design.jpeg",
  "Girl innovative.jpeg",
  "Girls Tech Cohort.jpeg",
  "Graduation.jpeg",
  "Hands-on learning.jpeg",
  "hub.jpeg",
  "Inclusive Community.jpeg",
  "Innovation Hub.jpeg",
  "innovation hub2.jpeg",
  "innovation hub3.jpeg",
  "innovations.jpeg",
  "meet the team.jpeg",
  "Mentorship.jpeg",
  "mentorship2.jpeg",
  "outing.jpeg",
  "outing2.jpeg",
  "outing5.jpeg",
  "outing6.jpeg",
  "prize winner.jpeg",
  "Project-Based Learning.jpeg",
  "Python.jpeg",
  "recreation.jpeg",
  "recreation2.jpeg",
  "Robotics.jpeg",
  "scholarship.jpeg",
  "sprint.jpeg",
  "student.jpeg",
  "student2.jpeg",
  "Visual Programming.jpeg",
  "Web Development.jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.54 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.55 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.55 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.56 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.56 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.57 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.57 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.58 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.07.59 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.00 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.00 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.01 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.02 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.02 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.05 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.05 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.16 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.16 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.17 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.17 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.19 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.19 PM (2).jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.19 PM.jpeg",
  "WhatsApp Image 2026-04-23 at 1.08.20 PM (1).jpeg",
  "WhatsApp Image 2026-04-23 at 11.23.12 AM.jpeg"
]

function prettifyGalleryTitle(fileName) {
  const baseTitle = fileName.replace(/\.(jpe?g|png|webp)$/i, '')
  const match = baseTitle.match(/^WhatsApp Image (\d{4})-(\d{2})-(\d{2}) at (\d{1,2})\.(\d{2})\.(\d{2}) (AM|PM)(?: \((\d+)\))?$/i)
  if (!match) return baseTitle

  const [, year, month, day, hourRaw, minute, _second, ampmRaw, variant] = match
  const hour = Number(hourRaw)
  const ampm = ampmRaw.toUpperCase()
  const date = `${day}/${month}/${year}`
  const time = `${hour}:${minute} ${ampm}`
  return { date, time, variant: variant ? String(variant) : '' }
}

function toTitleCase(text) {
  return text
    .split(' ')
    .filter(Boolean)
    .map((w) => (w.length ? `${w[0].toUpperCase()}${w.slice(1)}` : w))
    .join(' ')
}

function prettifyNonWhatsappTitle(fileName) {
  const base = fileName.replace(/\.(jpe?g|png|webp)$/i, '')
  const cleaned = base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Convert trailing digits into " X"
  const withSpaceBeforeDigits = cleaned.replace(/([a-zA-Z])(\d+)$/g, '$1 $2')

  // Small normalization for common gallery labels
  const normalized = withSpaceBeforeDigits
    .replace(/\bout\b/gi, 'Outing')
    .replace(/\bhub\b/gi, 'Hub')

  return toTitleCase(normalized)
}

export const GALLERY_IMAGES = ALL_SCHOOL_IMAGE_FILES.map((fileName, index) => {
  const named = NAMED_GALLERY_METADATA[fileName]
  const isWhatsapp = fileName.startsWith('WhatsApp Image')
  const whatsappMeta = isWhatsapp ? prettifyGalleryTitle(fileName) : null
  const title = named?.title ?? (isWhatsapp ? '' : prettifyNonWhatsappTitle(fileName))

  return {
    id: `gallery-${index + 1}`,
    src: mediaPath(fileName),
    alt: title,
    title,
    description:
      named?.description ??
      (isWhatsapp && whatsappMeta
        ? `Academy activity moment • ${whatsappMeta.date} • ${whatsappMeta.time}${whatsappMeta.variant ? ` (${whatsappMeta.variant})` : ''}.`
        : 'A photo from our academy activities and learning sessions.'),
  }
})

// Re-label WhatsApp images with stable sequential "Activity photo X" titles.
{
  let counter = 0
  for (const img of GALLERY_IMAGES) {
    if (!img.title) {
      counter += 1
      img.title = `Activity photo ${counter}`
      img.alt = img.title
    }
  }
}

export const PARTNER_LOGOS = [
  { name: 'Pestalozzi Academy', src: partnerLogoPath('pestalozzi Academy.jpeg') },
  { name: 'Rose Garden School', src: partnerLogoPath('Rose_Garden_School.png') },
  { name: 'TLL Academy / Learning Ladder', src: partnerLogoPath('TLL_Academy_and_Learning_Ladder.png') },
  { name: 'Best Buddies Academy', src: partnerLogoPath('Best_Buddies_Academy.png') },
]

export const PROGRAM_CARD_IMAGES = {
  digitalLiteracy: mediaPath('Digital Literacy.jpeg'),
  python: mediaPath('Python.jpeg'),
  robotics: mediaPath('Robotics.jpeg'),
  visualProgramming: mediaPath('Visual Programming.jpeg'),
  gameDesign: mediaPath('Game Design.jpeg'),
  webDevelopment: mediaPath('Web Development.jpeg'),
  cybersecurity: mediaPath('Cybersecurity.jpeg'),
  ai: mediaPath('Artificial Intelligence.jpeg'),
}
