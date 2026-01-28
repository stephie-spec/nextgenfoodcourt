import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer",
  });

    const sampleUsers = {
    'john@example.com': { password: 'password123', name: 'John Doe', role: 'customer', id: 1 },
    'jane@example.com': { password: 'password123', name: 'Jane Smith', role: 'customer', id: 2 },
    'customer@foodcourt.com': { password: 'food123', name: 'Demo Customer', role: 'customer', id: 3 },
    'owner@burgerparadise.com': { password: 'owner123', name: 'Burger Paradise Owner', role: 'owner', id: 4 },
    'pizza@mozzie.com': { password: 'pizza123', name: 'Mozzie Pizzeria', role: 'owner', id: 5 },
    'owner@foodcourt.com': { password: 'owner123', name: 'Demo Restaurant Owner', role: 'owner', id: 6 },
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", formData);

    const result = login(formData.email, formData.password);
    
    if (result.success) {
      if (result.user.role === "customer") {
        router.push("/customer/outlets");
      } else {
        router.push("/owner/outlets");
      }
    } else {
      setError("Invalid email or password");
    }

  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="text-center mb-4">Login</h3>

              <form onSubmit={handleSubmit}>
                
                <div className="mb-3">
                  <label className="form-label">Login as</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="customer">Customer</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

              
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>

              <p className="text-center mt-3">
                Don't have an account? <a href="/register">Register</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
