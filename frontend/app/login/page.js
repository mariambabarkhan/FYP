"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { LockIcon, UserIcon, ShieldIcon, StarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

export default function LoginScreen() {
  const router = useRouter();
  
  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot password states
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotStage, setForgotStage] = useState("request"); // "request" => send OTP, "reset" => reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(2);
  
  const [apiError, setApiError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }
      
      // Store user details locally (e.g., in localStorage) and redirect based on role.
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("username", data.username);
      if (data.role === "admin") {
        router.push("/admin-interface");
      } else {
        router.push("/queryinterface");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    let timer;
    if (showSuccessModal && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showSuccessModal && countdown === 0) {
      setShowSuccessModal(false);
      router.push("/login");
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, countdown, router]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setApiError("");
    
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Failed to send OTP");
        return;
      }
      // OTP sent successfully; move to next stage.
      setForgotStage("reset");
    } catch (error) {
      console.error("Send OTP error:", error);
      setApiError("An unexpected error occurred while sending OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError("");
    
    if (newPassword !== confirmNewPassword) {
      setApiError("Passwords do not match");
      return;
    }
    
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Failed to reset password");
        return;
      }
      // Password reset successful; return to login mode.
      setForgotPassword(false);
      setForgotStage("request");
      setApiError("");
      setShowSuccessModal(true);
      setCountdown(2);
    } catch (error) {
      console.error("Reset password error:", error);
      setApiError("An unexpected error occurred while resetting password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute w-full h-full object-cover"
      >
        <source src="/video2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="w-full max-w-6xl flex flex-col lg:flex-row justify-around relative z-10">
        <div className="w-[400px] backdrop-blur-md bg-black/30 rounded-lg shadow-xl overflow-hidden border border-white/20 p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <img src="/llama-transparent.png" alt="Logo" className="w-24 h-24 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Welcome to LLAMAR</h1>
          </div>
          {!forgotPassword ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
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
                    className="w-full bg-white/20 border-white/10 text-white placeholder-white/50 focus:border-white focus:border-2 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="password" className="text-sm font-medium text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/20 border-white/10 text-white placeholder-white/50 focus:border-white focus:border-2 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  />
                </div>
                <Button
                  className="w-full bg-white font-bold text-[#172554] hover:bg-white/90 transition-colors"
                  type="submit"
                >
                  Login
                </Button>
              </form>
              <div className="flex flex-row justify-end">
                <Button
                  variant="link"
                  className="mt-1 text-white hover:text-white/80 p-0"
                  onClick={() => setForgotPassword(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <div
                className="mt-4 text-white text-center hover:text-white/80 w-full"
                onClick={() => router.push("/register")}
              >
                Don't have an account? <b className="hover:underline hover:cursor-pointer">Register</b>
              </div>
            </>
          ) : (
            <>
              {forgotStage === "request" ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">Forgot Password</h2>
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-white">
                        Enter your email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/20 border-white/10 text-white placeholder-white/50 focus:border-white focus:border-2 focus:ring-2 focus:ring-white/50 focus:outline-none"
                      />
                    </div>
                    <Button
                      className="w-full bg-white font-bold text-[#172554] hover:bg-white/90 transition-colors"
                      type="submit"
                    >
                      Send OTP
                    </Button>
                  </form>
                  <div
                    className="mt-4 text-white text-center hover:text-white/80 w-full"
                    onClick={() => {
                      setForgotPassword(false);
                      setForgotStage("request");
                    }}
                  >
                    Back to Login
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-sm font-medium text-white">
                        Enter OTP
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter the OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="w-full bg-white/20 border-white/10 text-white placeholder-white/50 focus:border-white focus:border-2 focus:ring-2 focus:ring-white/50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium text-white">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-white/20 border-white/10 text-white placeholder-white/50 focus:border-white focus:border-2 focus:ring-2 focus:ring-white/50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-white">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="w-full bg-white/20 border-white/10 text-white placeholder-white/50 focus:border-white focus:border-2 focus:ring-2 focus:ring-white/50 focus:outline-none"
                      />
                    </div>
                    <Button
                      className="w-full bg-white font-bold text-[#172554] hover:bg-white/90 transition-colors"
                      type="submit"
                    >
                      Reset Password
                    </Button>
                  </form>
                  <div
                    className="mt-4 text-white text-center hover:text-white/80 w-full cursor-pointer"
                    onClick={() => {
                      setForgotPassword(false);
                      setForgotStage("request");
                    }}
                  >
                    Back to Login
                  </div>
                </>
              )}
            </>
          )}
          {apiError && <p className="mt-4 text-red-500 text-center">{apiError}</p>}
        </div>
      </div>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Password Reset Successful
            </DialogTitle>
            <DialogDescription>
              Your password has been reset successfully. Redirecting to login page in {countdown} seconds...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
