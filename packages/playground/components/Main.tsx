import LIST from "./data";
import { Anchor } from "spatial-focus-react";

const Main: React.FC<{ currentItem: number }> = ({ currentItem }) => {
  return (
    <div className="col-span-2 px-4 overflow-scroll">
      <p className="text-gray-500 font-medium text-2xl mb-6">
        {LIST[currentItem].title}
      </p>

      <div>
        {LIST[currentItem].todo.map((e) => (
          <Anchor key={e.text}>
            <button className="py-4 border-b border-solid border-gray-100 flex items-center w-full">
              <div
                className={`w-5 h-5 rounded-full mr-2 ${
                  e.mark ? "bg-gray-100" : "border border-solid border-gray-100"
                }`}
              />
              <p className="text-gray-500">{e.text}</p>
            </button>
          </Anchor>
        ))}
      </div>
    </div>
  );
};

export default Main;
