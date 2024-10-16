import React from 'react'
import { Link } from 'react-router-dom';
import Login from '../components/Login'

function Home() {
  return (
    <div>
        <Login/>
      <Link to='Login'><button>Login</button></Link>
    </div>
  )
}

export default Home