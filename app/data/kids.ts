export type AvatarColor = "sky" | "pink" | "green" | "yellow" | "purple" | "periwinkle";
export type ParentStatus = "active" | "pending";
export type ParentRole = "mother" | "father";

export type Parent = {
  name: string;
  initial: string;
  role: ParentRole;
  status: ParentStatus;
};

export type Kid = {
  id: string;
  name: string;
  initial: string;
  avatarColor: AvatarColor;
  ageYears: number;
  birthDate: string;
  room: string;
  enrollment: string;
  allergyLabel?: string;
  allergyNote?: string;
  parents: Parent[];
};

export const kids: Kid[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    initial: "M",
    avatarColor: "sky",
    ageYears: 3,
    birthDate: "12 mar 2022",
    room: "Soles",
    enrollment: "feb 2025",
    allergyLabel: "MANÍ",
    allergyNote: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    parents: [
      { name: "Lucía Fernández", initial: "L", role: "mother", status: "active" },
      { name: "Diego Fernández", initial: "D", role: "father", status: "pending" },
    ],
  },
  {
    id: "sofia-mendez",
    name: "Sofía Méndez",
    initial: "S",
    avatarColor: "pink",
    ageYears: 2,
    birthDate: "5 ago 2023",
    room: "Soles",
    enrollment: "mar 2025",
    parents: [
      { name: "Carolina Méndez", initial: "C", role: "mother", status: "active" },
    ],
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    initial: "B",
    avatarColor: "green",
    ageYears: 3,
    birthDate: "22 ene 2022",
    room: "Soles",
    enrollment: "feb 2025",
    parents: [
      { name: "Paula Ruiz", initial: "P", role: "mother", status: "active" },
      { name: "Martín Ruiz", initial: "M", role: "father", status: "active" },
    ],
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    initial: "V",
    avatarColor: "yellow",
    ageYears: 2,
    birthDate: "18 nov 2023",
    room: "Soles",
    enrollment: "abr 2025",
    parents: [],
  },
  {
    id: "tomas-diaz",
    name: "Tomás Díaz",
    initial: "T",
    avatarColor: "purple",
    ageYears: 3,
    birthDate: "30 jun 2022",
    room: "Soles",
    enrollment: "feb 2025",
    allergyLabel: "LACTOSA",
    allergyNote: "Intolerancia a la lactosa. Ofrecer alternativas sin lactosa en meriendas.",
    parents: [
      { name: "Ana Díaz", initial: "A", role: "mother", status: "active" },
    ],
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    initial: "E",
    avatarColor: "pink",
    ageYears: 2,
    birthDate: "9 sep 2023",
    room: "Soles",
    enrollment: "mar 2025",
    parents: [
      { name: "Laura Castro", initial: "L", role: "mother", status: "active" },
    ],
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    initial: "L",
    avatarColor: "sky",
    ageYears: 3,
    birthDate: "14 abr 2022",
    room: "Soles",
    enrollment: "feb 2025",
    parents: [
      { name: "Valeria Romero", initial: "V", role: "mother", status: "active" },
    ],
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    initial: "O",
    avatarColor: "green",
    ageYears: 2,
    birthDate: "27 jul 2023",
    room: "Soles",
    enrollment: "mar 2025",
    parents: [
      { name: "Marta Vega", initial: "M", role: "mother", status: "active" },
    ],
  },
];
