'use client';
import React from 'react';

const Navbar = ({ onSelectNav }) => {
  const handleNavClick = (category) => {
    onSelectNav(category);
  };

  return (
    <div className="bg-blue-600 text-white p-4">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-3">Choose Exercises</h1>
        <ul className="flex justify-center space-x-5 text-lg">
          <li
            className="cursor-pointer hover:text-blue-200 transition duration-200"
            onClick={() => handleNavClick('all')}
          >
            A-Z
          </li>
          <li
            className="cursor-pointer hover:text-blue-200 transition duration-200"
            onClick={() => handleNavClick('Body Part')}
          >
            Body Part
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
