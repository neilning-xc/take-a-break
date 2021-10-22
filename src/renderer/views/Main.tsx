/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import '../style/App.global.scss';
import img from '../assets/icon.png';

const Main = () => {
  return (
    <div className="container">
      <img className="back-logo" src={img} />
    </div>
  );
};

export default Main;
