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
            key={category}  
            type="button"
            className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setSelectedCategory(category)} 
          >
            {category} 
          </button>
        ))}
      </div>
    </div>
  );
}