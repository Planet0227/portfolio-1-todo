"use client";

import React, { JSX } from "react";

interface AppIconProps {
  size?: number;
}

const AppIcon:React.FC<AppIconProps> = ({ size = 24 }): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M32 6
      Q33 7, 42 16
      Q43 17, 58 32
      Q43 47, 42 48
      Q33 57, 32 58
      Q31 57, 22 48
      Q21 47, 6 32
      Q21 17, 22 16
      Q31 7, 32 6
      Z"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="6"
    />
    <path
      d="M26 18 L26 48 L58 48"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="6"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

export default AppIcon;
