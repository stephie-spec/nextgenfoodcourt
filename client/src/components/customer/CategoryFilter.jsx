export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) {
  return (
    <div className="container py-3">
      <div className="d-flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.name}
            type="button"
            className={`btn ${selectedCategory === category.name ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}