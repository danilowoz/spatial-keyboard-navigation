import { NavigationAnchor } from "spatial-focus-react";

const Header: React.FC = () => {
  return (
    <header className="col-span-3 p-5 flex justify-between">
      <NavigationAnchor>
        <a href="" className="text-gray-500">
          Reminder
        </a>
      </NavigationAnchor>

      <NavigationAnchor>
        <button className="bg-gray-50 text-gray-500 flex rounded-full w-10 h-10 text-2xl">
          <span className="m-auto">+</span>
        </button>
      </NavigationAnchor>
    </header>
  );
};

export default Header;
