export type PostKind = "achievement" | "activity" | "announcement";

export type Post = {
  id: string;
  kind: PostKind;
  authorName: string;
  authorInitial: string;
  time: string;
  publishedByYou: boolean;
  audience: string;
  body: string;
  photoCaption?: string;
  hearts: number;
  comments: number;
};

export const feedData = {
  greeting: "Buenas, Caro",
  meta: "12 niños · martes 17 jun",
  posts: [
    {
      id: "mateo-potty-milestone",
      kind: "achievement",
      authorName: "Mateo",
      authorInitial: "M",
      time: "14:20",
      publishedByYou: true,
      audience: "Para: familia de Mateo",
      body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
      hearts: 3,
      comments: 1,
    },
    {
      id: "mateo-tempera-painting",
      kind: "activity",
      authorName: "Mateo",
      authorInitial: "M",
      time: "09:40",
      publishedByYou: true,
      audience: "Para: familia de Mateo",
      body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
      photoCaption: "Foto · pintando con témperas",
      hearts: 5,
      comments: 2,
    },
    {
      id: "friday-park-outing",
      kind: "announcement",
      authorName: "Anuncio general",
      authorInitial: "",
      time: "07:50",
      publishedByYou: true,
      audience: "Para: toda la sala",
      body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
      hearts: 8,
      comments: 0,
    },
  ] satisfies Post[],
};
