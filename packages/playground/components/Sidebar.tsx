import LIST from "./data";
import { Area, Anchor } from "spatial-focus-react";

const Sidebar: React.FC<{ onClick: (number: number) => void }> = ({
  onClick,
}) => {
  return (
    <Area>
      <div className="row-span-3 px-5">
        <Anchor>
          <input
            placeholder="Search..."
            type="search"
            className="w-full mb-4 h-9 px-3 rounded-lg border border-solid border-gray-100"
          />
        </Anchor>

        <div className="grid grid-cols-2 grid-rows-2 gap-4 mb-8">
          <Anchor>
            <button className="bg-gray-50 p-6 rounded-lg flex justify-between">
              <p className="text-md text-gray-500 font-medium">Today</p>
              <p>10</p>
            </button>
          </Anchor>
          <Anchor>
            <button className="bg-gray-50 p-6 rounded-lg flex justify-between">
              <p className="text-md text-gray-500 font-medium">Flagged</p>
              <p>10</p>
            </button>
          </Anchor>
          <Anchor>
            <button className="bg-gray-50 p-6 rounded-lg flex justify-between">
              <p className="text-md text-gray-500 font-medium">Schedule</p>
              <p>0</p>
            </button>
          </Anchor>
          <Anchor>
            <button className="bg-gray-50 p-6 rounded-lg flex justify-between">
              <p className="text-md text-gray-500 font-medium">All</p>
              <p>20</p>
            </button>
          </Anchor>
        </div>

        <p className="text-xs font-medium uppercase mb-2 text-gray-400">List</p>
        {LIST.map((item, index) => {
          return (
            <Anchor key={item.title}>
              <button
                onClick={() => onClick(index)}
                className="bg-gray-50 block w-full text-left mb-2 px-2 py-1 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                {item.title}
              </button>
            </Anchor>
          );
        })}
      </div>
    </Area>
  );
};

export default Sidebar;
