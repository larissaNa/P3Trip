export function HomeViewModel() {
  const filters = ["Todos", "Praia", "Aventura", "Cultura", "Natureza"];

  const travelData = [
    {
      title: "Paraíso Tropical",
      location: "Maldivas",
      dateRange: "5 de dez. - 12 de dez.",
      days: 7,
      price: 12500,
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    },
    {
      title: "Aventura no Gelo",
      location: "Suíça",
      dateRange: "10 de jan. - 17 de jan.",
      days: 7,
      price: 12000,
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    },
  ];

  return { filters, travelData };
}
