export interface Template {
    path: string;
    color: string;
    thumbnail?: string;
  }
  
  export const templates: Template[] = [
    { 
      path: "/templates/template1.svg", 
      color: "#3f3b3a",
      thumbnail: "/templates/template1.svg" 
    },
    { 
      path: "/templates/template2.svg", 
      color: "#ffb400",
      thumbnail: "/templates/template2.svg" 
    },
    { 
      path: "/templates/template3.svg", 
      color: "#ffffff",
      thumbnail: "/templates/template3.svg" 
    },
    { 
      path: "/templates/template4.svg", 
      color: "#ffffff",
      thumbnail: "/templates/template4.svg" 
    },
    { 
      path: "/templates/template5.svg", 
      color: "#3f3b3a",
      thumbnail: "/templates/template5.svg" 
    },
  ];