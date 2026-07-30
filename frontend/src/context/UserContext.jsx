import axios from 'axios';
import React from 'react'
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { UserContextData } from './UserContextData';

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
      const fetchTimer = window.setTimeout(() => {
        fetchProfile();
      }, 0);
      return () => window.clearTimeout(fetchTimer);
    }
  },[loggedIn]);


  return (
    <UserContextData.Provider value={{loggedIn, setLoggedIn, profile, setProfile, fetchProfile }}>
        {children}
    </UserContextData.Provider>
  )
}

export default UserContext
