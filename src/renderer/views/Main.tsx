/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import '../style/App.global.scss';
// import { useLocation } from 'react-router-dom';
import img from '../assets/icon.png';

const Main = () => {
  // const location = useLocation();

  return (
    <div className="container">
      <img className="back-logo" src={img} />
    </div>
  );
};

export default Main;
