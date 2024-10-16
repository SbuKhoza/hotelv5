import React from 'react'

function Navbar() {
  return (
    <nav>
    <div className='logo'>
        <h1>Steady Hotel</h1>
    </div>

    <Link to="login">Login/Signup</Link>
    </nav>
  )
}

export default Navbar