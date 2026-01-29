export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            type="button"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}