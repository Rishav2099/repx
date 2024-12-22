'use client'
import { useState } from "react";

const AddExercise = () => {
  const [formData, setFormData] = useState({
    name: "",
    gif: "",
    description: "",
    muscleTargeted: [],
  });

  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/exercise/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setMessage("Exercise added successfully!");
      } else {
        setMessage(result.message || "Error adding exercise.");
      }
    } catch (error) {
      setMessage("Server error occurred.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen p-5 bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold mb-5">Add Exercise</h1>
      {message && <p className="mb-4 text-yellow-300">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Exercise Name"
          className="p-3 bg-gray-700 rounded-lg"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="gif"
          placeholder="GIF URL"
          className="p-3 bg-gray-700 rounded-lg"
          value={formData.gif}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          className="p-3 bg-gray-700 rounded-lg"
          value={formData.description}
          onChange={handleInputChange}
        />
        <select
          name="muscleTargeted"
          multiple
          className="p-3 bg-gray-700 rounded-lg"
          value={formData.muscleTargeted}
          onChange={(e) =>
            setFormData({
              ...formData,
              muscleTargeted: Array.from(
                e.target.selectedOptions,
                (option) => option.value
              ),
            })
          }
        >
          <option value="Chest">Chest</option>
          <option value="Back">Back</option>
          <option value="Shoulders">Shoulders</option>
          <option value="Biceps">Biceps</option>
          <option value="Triceps">Triceps</option>
          <option value="Legs">Legs</option>
          <option value="Abs">Abs</option>
          <option value="Glutes">Glutes</option>
          <option value="Hamstrings">Hamstrings</option>
          <option value="Quads">Quads</option>
          <option value="Calves">Calves</option>
          <option value="Forearms">Forearms</option>
        </select>
        <button type="submit" className="p-3 bg-blue-500 rounded-lg text-white">
          Add Exercise
        </button>
      </form>
    </div>
  );
};

export default AddExercise;
