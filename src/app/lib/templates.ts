export interface Template {
  id: string;
  name: string;
  category: "exclusive" | "classic";
  badge?: string;
  path: string;
  color: string; // Primary text color
  secondaryColor?: string; // Subtitle/designation color
  thumbnail?: string;
  hasDedicatedPhotoSlot: boolean;
  photoSlot: {
    cx: number;
    cy: number;
    r: number;
    shape?: "circle" | "arch" | "squircle";
  };
}

export const templates: Template[] = [
  // ================= EXCLUSIVE FRAMES =================
  {
    id: "exclusive-royal-gold",
    name: "রয়্যাল গোল্ড মেহরাব",
    category: "exclusive",
    badge: "এক্সক্লুসিভ",
    path: "/templates/exclusive1.svg",
    thumbnail: "/templates/exclusive1.svg",
    color: "#ffd978",
    secondaryColor: "#dfb242",
    hasDedicatedPhotoSlot: true,
    photoSlot: { cx: 500, cy: 380, r: 160, shape: "circle" },
  },
  {
    id: "exclusive-midnight-luxe",
    name: "মিডনাইট ক্রিসেন্ট স্যাফায়ার",
    category: "exclusive",
    badge: "প্রিমিয়াম",
    path: "/templates/exclusive2.svg",
    thumbnail: "/templates/exclusive2.svg",
    color: "#ffd76a",
    secondaryColor: "#9ec5fe",
    hasDedicatedPhotoSlot: true,
    photoSlot: { cx: 500, cy: 380, r: 160, shape: "arch" },
  },
  {
    id: "exclusive-ruby-palace",
    name: "ইম্পেরিয়াল রুবি অ্যান্ড গোল্ড",
    category: "exclusive",
    badge: "রয়্যাল",
    path: "/templates/exclusive3.svg",
    thumbnail: "/templates/exclusive3.svg",
    color: "#fce39e",
    secondaryColor: "#f3be7a",
    hasDedicatedPhotoSlot: true,
    photoSlot: { cx: 500, cy: 380, r: 158, shape: "squircle" },
  },
  {
    id: "exclusive-ivory-pearl",
    name: "আইভরি পার্ল ও রোজ গোল্ড",
    category: "exclusive",
    badge: "মার্জিত",
    path: "/templates/exclusive4.svg",
    thumbnail: "/templates/exclusive4.svg",
    color: "#3a251b",
    secondaryColor: "#8b5238",
    hasDedicatedPhotoSlot: true,
    photoSlot: { cx: 500, cy: 380, r: 158, shape: "circle" },
  },
  {
    id: "exclusive-sultanate-teal",
    name: "সুলতানি তুর্কিশ গ্রিন",
    category: "exclusive",
    badge: "নতুন",
    path: "/templates/exclusive5.svg",
    thumbnail: "/templates/exclusive5.svg",
    color: "#fae79d",
    secondaryColor: "#7ed6df",
    hasDedicatedPhotoSlot: true,
    photoSlot: { cx: 500, cy: 380, r: 160, shape: "circle" },
  },

  // ================= CLASSIC TEMPLATES =================
  {
    id: "classic-1",
    name: "ক্লাসিক গোল্ড অ্যান্ড ব্ল্যাক",
    category: "classic",
    path: "/templates/template1.svg",
    thumbnail: "/templates/template1.svg",
    color: "#3f3b3a",
    secondaryColor: "#717171",
    hasDedicatedPhotoSlot: false,
    photoSlot: { cx: 750, cy: 450, r: 180, shape: "circle" },
  },
  {
    id: "classic-2",
    name: "ক্লাসিক গোল্ডেন নাইট",
    category: "classic",
    path: "/templates/template2.svg",
    thumbnail: "/templates/template2.svg",
    color: "#ffb400",
    secondaryColor: "#ffeaa7",
    hasDedicatedPhotoSlot: false,
    photoSlot: { cx: 750, cy: 450, r: 180, shape: "circle" },
  },
  {
    id: "classic-3",
    name: "ক্লাসিক রয়্যাল হোয়াইট",
    category: "classic",
    path: "/templates/template3.svg",
    thumbnail: "/templates/template3.svg",
    color: "#ffffff",
    secondaryColor: "#dcdde1",
    hasDedicatedPhotoSlot: false,
    photoSlot: { cx: 750, cy: 450, r: 180, shape: "circle" },
  },
  {
    id: "classic-4",
    name: "ক্লাসিক পার্পল লাক্স",
    category: "classic",
    path: "/templates/template4.svg",
    thumbnail: "/templates/template4.svg",
    color: "#ffffff",
    secondaryColor: "#dfe4ea",
    hasDedicatedPhotoSlot: false,
    photoSlot: { cx: 750, cy: 450, r: 180, shape: "circle" },
  },
  {
    id: "classic-5",
    name: "ক্লাসিক ভিন্টেজ গোল্ড",
    category: "classic",
    path: "/templates/template5.svg",
    thumbnail: "/templates/template5.svg",
    color: "#3f3b3a",
    secondaryColor: "#717171",
    hasDedicatedPhotoSlot: false,
    photoSlot: { cx: 750, cy: 450, r: 180, shape: "circle" },
  },
];
