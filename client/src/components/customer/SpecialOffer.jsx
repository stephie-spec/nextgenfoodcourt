import { FaFire } from "react-icons/fa";

export default function SpecialOffer() {
  return (
    <div className="px-4 py-3">
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center justify-center">
            <FaFire className="text-3xl text-red-500" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-lg">Weekend Special!</h3>
            <p className="text-muted-foreground">Get flat 20% off on orders above Ksh. 5000.</p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-semibold rounded-full text-sm">
              Use code: WEEKEND20
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}