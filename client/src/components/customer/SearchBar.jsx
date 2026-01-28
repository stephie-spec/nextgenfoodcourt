export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="container py-3">
      <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Search outlets or dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => setSearchQuery("")}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
    </div>
  );
}