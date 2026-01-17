export type SeoJsonLdWebApplication = {
  "@context": "https://schema.org";
  "@type": "WebApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    "@type": "Offer";
    price: "0";
    priceCurrency: "USD";
  };
};

export type SeoJsonLdFaqPage = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type BuildWebApplicationJsonLdInput = {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem?: string;
  priceCurrency?: "USD";
};

export const buildWebApplicationJsonLd = (
  input: BuildWebApplicationJsonLdInput
): SeoJsonLdWebApplication => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory,
    operatingSystem: input.operatingSystem ?? "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: input.priceCurrency ?? "USD"
    }
  };
};

export const buildFaqPageJsonLd = (items: SeoFaqItem[]): SeoJsonLdFaqPage => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
};


