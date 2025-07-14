import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";
export const Profile =() => {
    const[data,setData]=useState({invetment:0,PL:0});
    const [displayName, setDisplayName] = useState('');
    useEffect(()=>{
        const userData=async()=>{
            const response=await axios.get('/userdata');
            if(response.status===200){
                setData({invetment:response.data.investment,PL:response.data.PL});
            }
        }

        const userName=()=>{
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
        }
        userName();

        userData();


    },[])

    

  return (
    <div className='text-white flex flex-col'>
        <span>{displayName}</span>
        <span>Investment:  ₹{Number(data.invetment).toFixed(2)}</span>
        <span>NET P/L:₹{Number(data.PL).toFixed(2)} </span>
    </div>
  )
}
