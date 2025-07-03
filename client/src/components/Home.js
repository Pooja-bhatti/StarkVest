import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";

export const Home = () => {
  const { isAuthenticated } = useAuth0();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
  const loadNameFromToken = () => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (!match) return;

      const token = decodeURIComponent(match[1]);
      const decoded = jwtDecode(token);
      if (decoded.name) {
        setDisplayName(decoded.name);
      } else {
        console.warn("Token decoded but name not found");
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  };

  if (isAuthenticated) {
    // Delay reading token slightly to ensure cookie is set
    const timeout = setTimeout(() => {
      loadNameFromToken();
    }, 500); // adjust if needed

    return () => clearTimeout(timeout);
  }
}, [isAuthenticated]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c1f] via-[#101010] to-[#00ffcc1a] px-4">
      <div className="relative w-full max-w-sm sm:max-w-md p-8 rounded-3xl shadow-2xl bg-white/10 border border-[#00ffcc] backdrop-blur-md flex flex-col items-center">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#00ffcc] via-transparent to-[#00ffcc] opacity-30 blur-lg pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl font-black text-[#00ffcc] tracking-wide mb-4 font-sans drop-shadow-lg">STARKVEST</h1>
          {isAuthenticated ? (
            <>
              <h2 className="text-2xl font-semibold text-white text-center">
                Hello, <span className="text-[#00ffcc]">{displayName}</span> <span className="animate-waving-hand">👋</span>
              </h2>
              <p className="text-gray-300 text-center mt-2 text-base">
                You're now logged in. Explore the market simulation!
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white text-center">Welcome Guest</h2>
              <p className="text-gray-300 text-center mt-2 text-base">
                Please sign in to begin your trading journey.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
