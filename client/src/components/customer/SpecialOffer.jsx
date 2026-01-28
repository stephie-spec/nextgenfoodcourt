export default function SpecialOffer() {
  return (
    <div className="container py-3">
      <div className="alert alert-warning">
        <div className="d-flex align-items-center">
          <i className="bi bi-fire text-danger fs-4 me-3"></i>
          <div>
            <strong>Weekend Special!</strong> Get flat 20% off on orders above Ksh. 5000.
          </div>
          <span className="ms-3 badge bg-success">Use code: WEEKEND20</span>
        </div>
      </div>
    </div>
  );
}