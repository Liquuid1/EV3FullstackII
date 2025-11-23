import React from 'react';
import './Search.css';

export const Search = ({ setBusqueda }) => {
  const handleChange = (e) => {
    setBusqueda(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="form-control"
        placeholder="Buscar zapatillas por nombre..."
        onChange={handleChange}
      />
    </div>
  );
};
