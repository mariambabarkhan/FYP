"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function QueryInterface() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const [response, setResponse] = useState("No response yet. Submit a query to see results.");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setResponse("Loading response...");
  
    try {
      const res = await fetch("http://127.0.0.1:5000/query", { // Make sure the URL matches your Flask server
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: query }),
      });
      if (!res.ok) {
        throw new Error("Error fetching response");
      }
      const data = await res.json();
      setResult(data.response);
    } catch (err) {
      console.error(err);
      setResult("Error occurred while processing your query.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const logout = (e) => {
    router.push("/login")
  }
  const handleReset = () => {
    setQuery("");
    setResult("");
  };

  const username = localStorage.getItem("username");

  const [currentUser] = useState({
    name: username,
  })

  // Dummy past chats
  const pastChats = [
    { id: 1, title: "Show me financial reports from 2022" },
    { id: 2, title: "What was the net revenue of the Kuri Town Project?" },
    { id: 3, title: "3 day leave request format" },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute w-full h-full object-cover"
      >
        <source src="/video2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="flex w-full relative z-10">
        {/* Sidebar */}
        <div className="w-64 bg-black/30 backdrop-blur-md p-4 border-r border-white/20 flex flex-col h-screen">
        <h2 className="text-xl font-bold text-white mb-4">Recent Queries</h2>
        <ScrollArea className="flex-1">
          {pastChats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className="w-full justify-start text-white hover:text-white hover:bg-white/10 mb-2"
            >
              {chat.title}
            </Button>
          ))}
        </ScrollArea>

        {/* User profile and logout section */}
        <div className="mt-auto pt-4 border-t border-white/20">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
              <span className="text-white font-semibold">{currentUser?.name?.charAt(0) || "U"}</span>
            </div>
            <div className="text-white">
              <p className="font-medium">{currentUser?.name || "User"}</p>
              
            </div>
          </div>
          <Button
            type="button"
            onClick={logout}
            variant="outline"
            className="w-full text-[#172554] hover:text-white border-white hover:bg-white/10"
          >
            Log Out
          </Button>
        </div>
      </div>
        {/* Main Content */}
        <div className="flex-1 p-4 flex items-center">
          <Card className="w-full backdrop-blur-md bg-black/30 rounded-lg shadow-xl overflow-hidden border border-white/20 p-8">
            <CardHeader>
              <div className="flex flex-row justify-between w-full">
                <p className="text-2xl font-bold text-white">Query LLAMAR</p>
              </div>
              <CardDescription className="text-white/70">
                Enter your query and receive a response from LLAMAR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your query here..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder-white/50"
                    required
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="bg-white text-[#172554] hover:bg-white/90 font-bold"
                    >
                      {loading ? "Loading..." : "Ask"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="outline"
                      className="text-white bg-transparent font-bold border-white hover:bg-white/10"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h3 className="text-lg font-semibold text-white mb-2">
                  LLAMAR Response:
                </h3>
                <div className="bg-white/10 p-4 rounded-md min-h-[100px] text-white">
                  {result || response}
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
