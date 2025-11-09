import React from "react";
import { HashLoader } from "react-spinners";

interface LoaderProps {
  title?: string;
}

const Loader: React.FC<LoaderProps> = ({ title }) => {
  return (
    <div className="w-full h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <HashLoader color="black" size={30} />
        {title && <h3 className="font-semibold text-xl">{title}...</h3>}
        <p>This won&apos;t take too long!</p>
      </div>
    </div>
  );
};

export default Loader;
