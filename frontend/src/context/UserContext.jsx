import axios from 'axios';
import React from 'react'
import { toast } from 'react-toastify';
import { useEffect } from 'react';

export const UserContextData = React.createContext();

const UserContext = ({children}) => {

  const [loggedIn, setLoggedIn] = React.useState(!!localStorage.getItem("edvance_token"));
  const [profile, setProfile] = React.useState(null);

  async function fetchProfile(){
    try{
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/getProfile`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edvance_token")}`
        }
      });
      console.log(response);
      if(response.data.success){
        setProfile(response.data.user);
      }
    }catch(error){
      console.log(error);
      toast.error("Error in fetching profile: " + error.message);
    }
  }

  useEffect(()=>{
    if(loggedIn){
      fetchProfile();
    }
  },[loggedIn]);


  return (
    <UserContextData.Provider value={{loggedIn, setLoggedIn, profile, fetchProfile }}>
        {children}
    </UserContextData.Provider>
  )
}

export default UserContext