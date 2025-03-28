import React from "react";
import { NavLink } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="relative flex justify-between items-center">
      <header className="p-4">
        <nav className="container mx-auto flex justify-center items-center">
          <ul className="flex space-x-4">
            <li>
              <NavLink to="/" className="hover:underline">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/real-sensor" className="hover:underline">
                Serial Port Stream
              </NavLink>
            </li>
            <li>
              <NavLink to="/fake-sensor" className="hover:underline">
                Emulated Data Stream
              </NavLink>
            </li>
            <li>
              <NavLink to="/workflow" className="hover:underline">
                Workflow
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
