import { Fragment } from "react";
import { Area, Anchor } from "spatial-keyboard-navigation-react";
import LIST from "./data";
import ContextMenuDemo from "./ContextDemo";

const Options: React.FC<{ area?: boolean }> = ({ area }) => {
  const MaybeArea = area ? Area : Fragment;

  return (
    <MaybeArea>
      <div className="row-span-3 px-5">
        <p className="text-md text-gray-500 font-medium mb-2">Title</p>
        <Anchor>
          <input
            placeholder="Title..."
            type="search"
            className="w-full mb-4 h-9 px-3 rounded-lg border border-solid border-gray-100"
          />
        </Anchor>

        <p className="text-md text-gray-500 font-medium mb-2">Description</p>
        <Anchor>
          <input
            placeholder="Description..."
            type="search"
            className="w-full mb-4 h-9 px-3 rounded-lg border border-solid border-gray-100"
          />
        </Anchor>

        <p className="text-md text-gray-500 mt-4 mb-2">Related tasks</p>
        <ContextMenuDemo>
          {LIST.map((item) => {
            return (
              <Anchor key={item.title}>
                <button className="bg-gray-50 block w-full text-left mb-2 px-2 py-1 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                  {item.title}
                </button>
              </Anchor>
            );
          })}
        </ContextMenuDemo>
      </div>
    </MaybeArea>
  );
};

export default Options;
