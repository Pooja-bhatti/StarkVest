import React from 'react'
import { useAuth0 } from "@auth0/auth0-react";

export const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  const getDisplayName = () => {
    if (!user) return '';

    const isSocial = user["https://your-app.com/isSocial"];
    console.log("Is social login?", isSocial);

    // Social login: return name; else return username (custom claim)
    return isSocial
      ? user.name
      : user["https://your-app.com/username"] || user.nickname || user.name;
  };

  return (
    <div>
      <h1>Home</h1>
      {isAuthenticated ? (
        <>
          <h2>Hello {getDisplayName()}</h2>
        </>
      ) : (
        <h2>Welcome</h2>
      )}
    </div>
  );
};

