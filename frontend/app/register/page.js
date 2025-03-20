"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return regex.test(password);
  };

  useEffect(() => {
    let timer;
    if (showSuccessModal && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showSuccessModal && countdown === 0) {
      setShowSuccessModal(false);
      router.push("/login");
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, countdown, router]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setApiError("");

    // Validate password complexity.
    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 12 characters long, with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character."
      );
      return;
    } else {
      setPasswordError("");
    }

    // Validate that password and confirmPassword match.
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    } else {
      setConfirmPasswordError("");
    }

    // Build the registration payload.
    const payload = { username, password, email };
    console.log("Registration payload:", payload);

    try {
      // Send the registration request to your API endpoint.
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // If the registration failed, display the error.
        setApiError(data.error || "Registration failed");
        return;
      }

      // On success, show the success modal.
      setShowSuccessModal(true);
      setCountdown(2);
    } catch (error) {
      console.error("Registration error:", error);
      setApiError("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <video autoPlay loop muted className="absolute w-full h-full object-cover">
        <source src="/video2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="w-full max-w-6xl flex flex-col lg:flex-row justify-around relative z-10">
        <div className="w-[400px] backdrop-blur-md bg-black/30 rounded-lg shadow-xl overflow-hidden border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Register</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email and Name Fields */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="firstname" className="text-sm font-medium text-white">
                  First Name
                </Label>
                <Label htmlFor="lastname" className="text-sm font-medium text-white">
                  Last Name
                </Label>
              </div>
              <div className="flex justify-between space-x-2">
                <Input
                  id="firstname"
                  placeholder="Enter your first name"
                  className="w-[calc(50%-0.5rem)] bg-white/20 border border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50 focus:outline-none"
                />
                <Input
                  id="lastname"
                  placeholder="Enter your last name"
                  className="w-[calc(50%-0.5rem)] bg-white/20 border border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50 focus:outline-none"
                />
              </div>
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </Label>
              <Input
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/20 border border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
            </div>
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-white">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/20 border border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setPassword(newPassword);
                  // Remove warning dynamically when password becomes valid.
                  if (validatePassword(newPassword)) {
                    setPasswordError("");
                  }
                }}
                required
                className="w-full bg-white/20 border border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-white">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-white/20 border border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
            </div>

            {/* API Error */}
            {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

            {/* Submit Button */}
            <Button
              className="w-full bg-white font-bold text-[#172554] hover:bg-white/90 transition-colors"
              type="submit"
            >
              Register
            </Button>
          </form>

          {/* Login Link */}
          <div
            className="mt-4 text-white text-center hover:text-white/80 w-full"
            onClick={() => router.push("/login")}
          >
            Already have an account? <b className="hover:underline hover:cursor-pointer">Login</b>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Registration Successful
            </DialogTitle>
            <DialogDescription>
              Your account has been created successfully. Redirecting to login page in {countdown} seconds...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
