export const outletTemplates = [
  {
    name: 'Addis Kitchen',
    cuisine: 'Ethiopian',
    image: '/outlet-showcase-1.jpg',
    location: 'Level 2 - Court A',
    hours: '10:00 AM - 10:00 PM',
    phone: '+1 (555) 123-4501',
    description: 'Authentic Ethiopian cuisine with traditional injera and aromatic spices.',
  },
  {
    name: 'Lagos Grill',
    cuisine: 'Nigerian',
    image: '/outlet-showcase-2.jpg',
    location: 'Level 2 - Court B',
    hours: '10:00 AM - 10:00 PM',
    phone: '+1 (555) 123-4502',
    description: 'Vibrant Nigerian flavors with signature jollof and grilled specialties.',
  },
  {
    name: 'Nairobi Flame',
    cuisine: 'Kenyan',
    image: '/outlet-showcase-3.jpg',
    location: 'Level 2 - Court C',
    hours: '10:00 AM - 10:00 PM',
    phone: '+1 (555) 123-4503',
    description: 'Traditional Kenyan grilled meats cooked over charcoal, fresh and smoky.',
  },
  {
    name: 'Kinshasa Kitchen',
    cuisine: 'Congolese',
    image: '/outlet-showcase-4.jpg',
    location: 'Level 2 - Court D',
    hours: '10:00 AM - 10:00 PM',
    phone: '+1 (555) 123-4504',
    description: 'Authentic Congolese dishes featuring traditional cooking methods.',
  },
];

export const getMockOutlets = () => {
  const outlets = [];
  for (let i = 0; i < 20; i++) {
    const template = outletTemplates[i % outletTemplates.length];
    outlets.push({
      id: i + 1,
      name: `${template.name} ${i + 1}`,
      cuisine: template.cuisine,
      image: template.image,
      location: template.location,
      hours: template.hours,
      phone: template.phone,
      description: template.description,
    });
  }
  return outlets;
};

export const getCuisineList = () => {
  const cuisines = new Set(outletTemplates.map((template) => template.cuisine));
  return Array.from(cuisines);
};
