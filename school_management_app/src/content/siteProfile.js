import { SCHOOL_MEDIA_IMAGES } from './schoolMedia'

export const SCHOOL_IMAGES = {
  hero: SCHOOL_MEDIA_IMAGES.hero,
  lab: SCHOOL_MEDIA_IMAGES.lab,
  classA: SCHOOL_MEDIA_IMAGES.classA,
  classB: SCHOOL_MEDIA_IMAGES.classB,
  classC: SCHOOL_MEDIA_IMAGES.classC,
}

/**
 * Brochure-style three-column layout: white | royal blue | periwinkle
 */
export const COURSE_BROCHURE_COLUMNS = [
  {
    tone: 'white',
    courses: [
      {
        title: 'Programming in Scratch Jr',
        ages: '5–7',
        desc: 'A playful first dive into algorithms and code—building logical thinking through games and stories.',
      },
      {
        title: 'Technology Literacy',
        ages: '7–9',
        desc: 'Productivity tools (Docs, Sheets, Slides), graphic design basics, online communication, and digital safety.',
      },
      {
        title: 'Programming in Scratch',
        ages: '9–10',
        desc: 'Programming fundamentals with Scratch—students create their own games and cartoons.',
      },
    ],
  },
  {
    tone: 'royal',
    courses: [
      {
        title: 'Programming in Game Design',
        ages: '10–11',
        desc: 'Lua and Roblox Studio—build immersive worlds and interactive game experiences.',
      },
      {
        title: 'Robotics',
        ages: '9–11',
        desc: 'From core components to programming—students design and build their own robots.',
      },
      {
        title: 'Graphic Design',
        ages: '9–14',
        desc: 'Visual communication, design tools, and crafting visuals that guide attention and tell a story.',
      },
    ],
  },
  {
    tone: 'periwinkle',
    courses: [
      {
        title: 'Web Development Level 1',
        ages: '15–18',
        desc: 'HTML, CSS, and JavaScript—dynamic pages, friendly interfaces, and creative ideas online.',
      },
      {
        title: 'Python Level 1',
        ages: '12–13',
        desc: 'Python basics, a simple AI chatbot, and creative art with Turtle graphics.',
      },
      {
        title: 'Python Level 2',
        ages: '14–17',
        desc: 'Mobile apps, modern web skills, and machine learning—building like professionals.',
      },
    ],
  },
]

export const MISSION_VISION_VALUES = {
  mission:
    'To ignite creativity and technical mastery through hands-on, project-based learning, equipping students with future-ready skills to thrive in a technology-driven world.',
  vision:
    'To cultivate Africa’s next generation of tech leaders who innovate responsibly, solve local and international challenges, and compete globally.',
  values: [
    { title: 'Excellence', text: 'Rigorous standards aligned with global tech benchmarks.' },
    { title: 'Innovation', text: 'Curriculum that integrates emerging technologies.' },
    { title: 'Inclusivity', text: 'Welcoming learners of all backgrounds and skill levels.' },
    { title: 'Collaboration', text: 'Teamwork among students, educators, and industry partners.' },
    { title: 'Empowerment', text: 'Confidence through personalized learning journeys.' },
  ],
}

export const PROFILE_INTRO = {
  title: 'Introduction',
  lead:
    'Anvil Coding Academy is a premier extracurricular institution dedicated to equipping students with technological skills—from coding and programming to robotics and data literacy.',
  about:
    'We empower the next generation of tech leaders through high-quality, hands-on, project-based learning for students of all ages.',
  specialties: [
    'Programming languages: Python, Java, and JavaScript for apps and websites.',
    'Web development with HTML, CSS, and JavaScript.',
    'Game development with engines such as Unity and Unreal.',
    'Robotics: build and program robots for teamwork and problem-solving.',
    'Data science: introductory analysis and visualization.',
  ],
}

export const OVERVIEW_FACTS = {
  foundedWhere: 'December 13, 2024 — Lusaka, Zambia',
  visionShort: 'Democratize technology education and empower African youth as innovators in the digital economy.',
  audience: 'Students aged 5–18 years',
  founders: 'A coalition of educators and tech professionals',
  goal: 'Address Zambia’s digital skills gap with world-class programming education.',
  facilitySqFt: '2,500 sq. ft.',
  facilityPoints: [
    'Smart classrooms with interactive whiteboards and ergonomic workstations.',
    'Advanced computer labs (40+ stations) with Unity, VS Code, and industry tools.',
    'Innovation hub for robotics (Arduino, Aviskaar) and AI projects.',
    'Collaborative zones for team projects and peer learning.',
  ],
}

export const MILESTONES = [
  { year: '2024', text: 'Official registration & establishment.' },
  { year: 'Jan 2025', text: 'Launched inaugural courses in Python, Java, JavaScript, and web development.' },
  { year: 'Ongoing', text: 'Partnerships with Lusaka International School, Trinade Technologies, and Family Development Initiatives.' },
]

export const ACADEMIC_OFFERINGS_TABLE = [
  {
    age: '5–9 years',
    focus: 'Foundational coding',
    skills: 'Scratch Jr, Scratch, digital safety, Technology Literacy',
  },
  {
    age: '10–13 years',
    focus: 'Intermediate development',
    skills: 'HTML/CSS, Roblox Studio (Lua), Python levels & AI foundations',
  },
  {
    age: '14–18 years',
    focus: 'Advanced tech & innovation',
    skills: 'Unity (C#), IoT, cloud computing & AI',
  },
]

export const SIGNATURE_PROGRAMS = [
  {
    title: 'Code for Good',
    text: 'Tech solutions for community challenges—e.g. mental health tools, environmental data apps, and housing simulations.',
  },
  {
    title: 'Techpreneur Series',
    text: 'Coding paired with entrepreneurship training.',
  },
  {
    title: 'Future Skills Bootcamps',
    text: 'Holiday intensives: AI with Scratch, robotics, VR/AR, and cybersecurity awareness.',
  },
]

export const VALUE_DIFFERENTIATORS = {
  why: [
    'Modern pedagogy aligned with technologies in use today.',
    'Age-appropriate paths—from gamified coding to professional-grade tools for teens.',
    'STEAM integration blending coding with science, arts, and math.',
    'Portfolio building: websites, apps, games, AI chatbots, and animations.',
    'Industry mentorship via Trinade Technologies Limited.',
    'Safety first: robust child protection and safeguarding policies.',
  ],
  trends: [
    'Quarterly curriculum updates for AI, IoT, and robotics (Aviskaar).',
    'Themed workshops on tools like Flutter and AWS.',
  ],
}

export const FACULTY_AND_ENVIRONMENT = {
  faculty: [
    { label: 'Qualifications', text: 'Bachelor’s degrees in ICT/Computer Science; industry experience in software, robotics, and AI.' },
    { label: 'Professional development', text: 'Monthly training on emerging technologies and pedagogy.' },
  ],
  facilities: [
    { label: 'Dynamic classrooms', text: 'Reconfigurable spaces for individual and group work.' },
    { label: 'Maker labs', text: '3D printers, VR headsets, and robotics kits.' },
    { label: 'Digital resources', text: 'Learning resources with coding platforms, video tutorials, and progress updates.' },
  ],
}

export const STUDENT_SUCCESS = {
  achievements: [
    '92% student satisfaction (2024–2025).',
    '45+ real-world projects deployed—including a nationally recognized mental health app and an AI homework assistant chatbot tested by 100+ students.',
  ],
  progress: [
    'Personalized learning plans by skill level.',
    'Digital portfolios showcasing growth.',
    'Quarterly reports for parents with achievements and next steps.',
  ],
}

export const COMMUNITY_PARTNERSHIPS = [
  {
    name: 'Family Development Initiatives',
    text: 'Workshops on digital literacy and technology access for underserved communities.',
  },
  {
    name: 'Lusaka International Community School (LICS)',
    text: 'Co-developed STEAM programs, safeguarding training, and student exchanges in visual programming.',
  },
  {
    name: 'Learning Ladder International School',
    text: 'Extra-curricular alignment to embed age-appropriate coding in primary frameworks.',
  },
  {
    name: 'Best Buddies School',
    text: 'Inclusive tech education—collaborative projects between neurodiverse and mainstream students.',
  },
]

export const PARTNERSHIP_OBJECTIVES = [
  'Cross-institutional teacher training on safeguarding.',
  'Community tech literacy drives.',
  'Student project showcases.',
  'Resource-sharing for equitable access.',
]

export const SCHOOL_PROFILE = {
  name: 'Anvil Coding Academy',
  tagline: 'Powering innovators and shaping the future.',
  heroTitle: 'The Best Coding School For Your Child',
  heroSubtitle:
    'An extracurricular technology school equipping young learners with essential digital skills for the modern world.',
  description:
    'We specialize in Digital Literacy, Coding, Robotics, Cyber Security, and Artificial Intelligence — preparing students aged 5 to 19 years for the future of technology.',
  focusAges: '5–19 years',
  aboutLead:
    'At Anvil Coding Academy, we are committed to empowering young people with digital skills while nurturing creativity, collaboration, and global awareness.',
  aboutBody:
    'Our programs go beyond coding. We build confident, innovative thinkers ready to solve real-world problems in their communities.',
  mission: MISSION_VISION_VALUES.mission,
  vision: MISSION_VISION_VALUES.vision,
  founded: 'Established on December 13, 2024',
  pricing: {
    perCourse: 'K8000 per course (2025–2026)',
    paymentOptions: ['25%', '50%', '75%', '100%'],
    duration: '8 months',
  },
  contact: {
    email: 'admission@anvilcodingacademy.com',
    phone: '+260 773823113',
    localPhone: '773823113',
    address: 'Ibex hill American embassy road, plot 100/735, Lusaka, Zambia',
    social: 'anvilcodingschool',
  },
}

export const PROGRAM_TRACKS = [
  {
    id: 'digital-literacy',
    title: 'Digital Literacy',
    level: 'Foundation',
    desc: 'Essential computer skills, productivity tools, online communication, and digital safety.',
    age: '7-9 years',
  },
  {
    id: 'python',
    title: 'Python Level 1',
    level: 'Beginner',
    desc: 'Introduction to Python, AI chatbot basics, and Turtle graphics art.',
    age: '12-13 years',
  },
  {
    id: 'python2',
    title: 'Python Level 2',
    level: 'Advanced',
    desc: 'Mobile apps, web development fundamentals, and machine learning basics.',
    age: '14-17 years',
  },
  {
    id: 'scratch-jr',
    title: 'Programming in Scratch Jr',
    level: 'Starter',
    desc: 'First step into algorithms through play-based coding and logic activities.',
    age: '5-7 years',
  },
  {
    id: 'scratch',
    title: 'Programming in Scratch',
    level: 'Beginner',
    desc: 'Build games and animations while learning core programming concepts.',
    age: '9-10 years',
  },
  {
    id: 'web',
    title: 'Web Development Level 1',
    level: 'Intermediate',
    desc: 'Create dynamic pages with HTML, CSS, and JavaScript.',
    age: '15-18 years',
  },
  {
    id: 'game',
    title: 'Game Design',
    level: 'Intermediate',
    desc: 'Create game worlds and interactive experiences with Lua and Roblox Studio.',
    age: '10-11 years',
  },
  {
    id: 'robotics',
    title: 'Robotics',
    level: 'Beginner to Intermediate',
    desc: 'Build and program robots while learning teamwork and systems thinking.',
    age: '9-11 years',
  },
  {
    id: 'graphic',
    title: 'Graphic Design',
    level: 'Creative Track',
    desc: 'Use modern design tools to create compelling visual communication.',
    age: '9-14 years',
  },
  {
    id: 'cyber',
    title: 'Cyber Security (Awareness)',
    level: 'Future Skills',
    desc: 'Security basics, safe online behavior, and introductory cyber concepts for teens.',
    age: '13-19 years',
  },
  {
    id: 'ai',
    title: 'Artificial Intelligence (Intro)',
    level: 'Future Skills',
    desc: 'AI fundamentals with hands-on activities and beginner-friendly projects.',
    age: '12-19 years',
  },
]

export const CLIENT2_COURSES = [
  {
    title: 'Digital Literacy',
    text: 'Students learn essential computer skills, internet safety, typing, productivity tools, and responsible digital citizenship.',
  },
  {
    title: 'Visual Programming',
    text: 'Designed for younger learners, this course introduces coding concepts using block-based platforms to build logic, sequencing, and problem-solving in a fun way.',
  },
  {
    title: 'Programming in Game Design',
    text: 'Students create interactive games while mastering core programming concepts such as variables, loops, and events.',
  },
  {
    title: 'Robotics Start',
    text: 'An introductory robotics course covering basic electronics, sensors, motors, and simple robot construction.',
  },
  {
    title: 'Robotics Pro',
    text: 'An advanced robotics program focused on automation, advanced programming, robotics engineering concepts, and real-world problem-solving.',
  },
  {
    title: 'Web Development',
    text: 'Students learn to design and build websites using HTML, CSS, and modern web design tools.',
  },
  {
    title: 'Python Start',
    text: 'A beginner-friendly introduction to Python focused on logic building and simple applications.',
  },
  {
    title: 'Python Pro',
    text: 'An advanced Python course covering GUI development, automation, projects, and real-world applications.',
  },
  {
    title: 'Cyber Security',
    text: 'Students learn ethical hacking basics, online safety, data protection, and cyber threat awareness.',
  },
  {
    title: 'Artificial Intelligence (AI)',
    text: 'An introduction to AI concepts, machine learning basics, and real-world AI applications.',
  },
]

export const WHY_CHOOSE_ANVIL = [
  'Age-appropriate structured curriculum',
  'Hands-on practical learning',
  'Project-based teaching approach',
  'Small class sizes for personalized attention',
  'Preparation for future careers in technology',
  'Encourages creativity, innovation, and critical thinking',
]

export const FACILITIES = [
  { id: 'projects', title: 'Project-Based Learning', text: 'Students learn by building real projects and solving real challenges.' },
  { id: 'mentor', title: 'Mentorship', text: 'Regular coach feedback and personalized progress support.' },
  { id: 'community', title: 'Inclusive Community', text: 'A diverse student community with cross-cultural collaboration.' },
  { id: 'innovation', title: 'Innovation Hub', text: 'Hands-on exposure to robotics, AI, and modern digital tools.' },
]

export const CULTURE_POINTS = [
  'Share ideas and perspectives from different cultures.',
  'Build friendships and collaboration across borders.',
  'Develop global communication skills.',
  'Learn to work in diverse teams, a key modern workplace skill.',
]

/** Copy for the dedicated newsletter page and the home-page teaser. */
export const NEWSLETTER_CONTENT = {
  headline: 'The Anvil Briefing',
  lead:
    'Monthly updates for families and partners: programs, events, student wins, and community news—straight to your inbox.',
  topics: [
    { label: 'Program highlights', description: 'New tracks, levels, and spotlight courses.' },
    { label: 'Event calendar', description: 'Open days, showcases, and holiday bootcamps.' },
    { label: 'Student showcases', description: 'Projects and achievements from our learners.' },
    { label: 'Community updates', description: 'Partners, grants, and ways to get involved.' },
  ],
  cadence: 'We send about one email per month. Unsubscribe anytime—we respect your inbox.',
  privacy:
    'We use your email only for this newsletter. We never sell addresses. Questions? Reach us on the contact page.',
}

export const FAQ_ITEMS = [
  {
    q: 'What makes Anvil Coding Academy different?',
    a: 'Our approach is highly practical: students learn by building real projects and receiving structured feedback.',
  },
  {
    q: 'Which programs are offered?',
    a: 'We offer Python, Scratch, web development, game design, robotics, technology literacy, and graphic design.',
  },
  {
    q: 'Do you support cultural and international learning?',
    a: 'Yes. We actively run cultural sharing sessions and cross-country collaboration activities.',
  },
  {
    q: 'How can parents follow student progress?',
    a: 'Parents can follow learner progress through regular updates, showcases, and structured feedback.',
  },
]

export const ACADEMIC_CALENDAR_2026 = {
  year: 2026,
  title: 'Academic Calendar 2026',
  intro:
    'Official schedule for instructional periods, assessments, bootcamps, internships, and graduation milestones.',
  weekendPolicy:
    'All Saturdays and Sundays are official class days for lectures, practicals, workshops, assessments, and supervised academic activities.',
  eventsByMonth: [
    {
      month: 'January',
      events: [
        '9 January - Meet the Instructor',
        '10 January - Resumption of Classes for Regular Students',
        '31 January - Chess Tournament',
      ],
    },
    {
      month: 'February',
      events: ['20 February - General Knowledge and Arts Activity'],
    },
    {
      month: 'March',
      events: ['7 March - Assessments and Project Presentations'],
    },
    {
      month: 'April',
      events: ['6-30 April - Bootcamp', '18-25 April - Day Tourism / Internship'],
    },
    {
      month: 'May',
      events: ['30 May - Board Games with School Partner Competition'],
    },
    {
      month: 'July',
      events: ['4 July - Joy Jam Day / Assessments and Project Presentations'],
    },
    {
      month: 'September',
      events: [
        '5-19 September - Project Presentations and Assessments',
        '26 September - Graduation Ceremony (Cohort 2)',
      ],
    },
    {
      month: 'October',
      events: ['3 October - Commencement of Cohort 3'],
    },
    {
      month: 'December',
      events: ['7-19 December - Bootcamp', '19 December - Closure of Regular Students'],
    },
  ],
  keyPolicies: [
    'Weekend attendance is mandatory unless officially exempted.',
    'Bootcamp attendance is compulsory unless otherwise stated.',
    'Assessments include continuous evaluation, project work, and practical/oral presentations.',
    'Calendar updates may be communicated through official school channels.',
  ],
}

