'use client';
import React, { useEffect, useState } from 'react';
import Navbar from './(components)/Navbar';
import axios from 'axios';
import Loader from '../components/Spinner';

export const ExercisesContext = React.createContext(); // Context for exercises

export default function RootLayout({ children }) {
  const [selectCategory, setSelectCategory] = useState('all');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/api/exercise?category=${selectCategory}`);
        console.log(res.data.exercises);
        setExercises(res.data.exercises || []); // Fallback to empty array
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false)
      }
    };
    fetchExercises();
  }, [selectCategory]);

  return (
    <html lang="en">
      <body>
        <ExercisesContext.Provider value={{ exercises, setSelectCategory }}>
          <div>
            <Navbar onSelectNav={(category) => setSelectCategory(category)} />
            <main>
              {loading ? (
                <Loader />
              ) : ( children )}
            </main>
          </div>
        </ExercisesContext.Provider>
      </body>
    </html>
  );
}
