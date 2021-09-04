import { Anchor, Area } from "spatial-focus-react";

const Header: React.FC = () => {
  return (
    <Area>
      <header className="col-span-4 p-5 flex justify-between">
        <Anchor>
          <a href="" className="text-gray-500">
            Reminder
          </a>
        </Anchor>

        <Anchor>
          <button className="bg-gray-50 text-gray-500 flex rounded-full w-10 h-10 text-2xl">
            <span className="m-auto">+</span>
          </button>
        </Anchor>
      </header>
    </Area>
  );
};

export default Header;
