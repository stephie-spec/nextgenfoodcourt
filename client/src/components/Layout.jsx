export default function Layout({ children }) {
  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <div className="container">
          <span className="navbar-brand">Food Court</span>
        </div>
      </nav>
      <div className="container mt-4">
        {children}
      </div>
    </div>
  );
}