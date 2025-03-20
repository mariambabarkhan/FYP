"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminInterface() {
  const [file, setFile] = useState(null);
  const [acquisitionStatus, setAcquisitionStatus] = useState("");
  const [systemLogs, setSystemLogs] = useState("No recent logs.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();


  // Check if the logged-in user is an admin.
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      // If not an admin, redirect to login page (or another appropriate page)
      router.push("/login");
    }
  }, [router]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const username = localStorage.getItem("username");
  const logout = () => {
    // Clear any stored user info if necessary
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          throw new Error("Error uploading file");
        }
        const data = await res.json();
        // Update UI based on the response from the backend
        setAcquisitionStatus(data.message);
        setSystemLogs((prev) => {
          const newLog = `${new Date().toLocaleString()}: Document "${file.name}" added to LLAMAR's knowledge base.`;
          return prev === "No recent logs." ? newLog : `${newLog}\n${prev}`;
        });
      } catch (err) {
        console.error(err);
        setAcquisitionStatus("Error occurred during file upload.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setAcquisitionStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <video autoPlay loop muted className="absolute w-full h-full object-cover">
        <source src="/video2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Card className="w-full max-w-2xl backdrop-blur-md bg-black/30 rounded-lg shadow-xl overflow-hidden border border-white/20 relative z-10">
        <CardHeader>
          <div className="flex flex-row justify-between w-full">
            <p className="text-2xl font-bold text-white">Hello {username}</p>
            <div className="flex flex-row">
              <Button
                type="button"
                variant="outline"
                className="text-[#172554] font-bold border-white hover:bg-white/10 mr-2"
                onClick={() => router.push("/queryinterface")}
              >
                Ask LLAMAR
              </Button>
              <Button
                type="button"
                onClick={logout}
                variant="outline"
                className="text-[#172554] font-bold border-white hover:bg-white/10"
              >
                Log Out
              </Button>
            </div>
          </div>
          <CardDescription className="text-white/70">
            Add new data to the knowledge graph and view system logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Upload Document
                </label>
                <div className="flex items-center">
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white font-bold text-[#172554] hover:bg-white/90 mr-2 flex flex-row items-center"
                  >
                    Browse
                    <img src="/browse.png" alt="Upload" className="w-4 h-4" />
                  </Button>
                  <span className="text-white text-sm truncate">
                    {file ? file.name : "No file chosen"}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-white font-bold text-[#172554] hover:bg-white/90"
                  disabled={!file || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Document"}
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="outline"
                  className="text-[#172554] font-bold border-white hover:bg-white/10"
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>
          {acquisitionStatus && (
            <div className="mt-4 p-2 bg-green-500/20 text-green-300 rounded">
              {acquisitionStatus}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start">
          <h3 className="text-lg font-semibold text-white mb-2">System Logs:</h3>
          <Textarea
            value={systemLogs}
            readOnly
            className="w-full min-h-[150px] bg-white/10 text-white border-white/20"
          />
        </CardFooter>
      </Card>
    </div>
  );
}
