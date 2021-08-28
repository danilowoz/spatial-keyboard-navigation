import { NavigationProvider } from "spatial-focus-react";

import "show-keys";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Main from "../components/Main";
import { useState } from "react";

const App: React.FC = () => {
  const [currentItem, setCurrentItem] = useState(0);

  return (
    <NavigationProvider>
      <style>{`[data-focus-visible-added] {
    outline: 2px solid #7B61FF;
}
 `}</style>
      <div
        className="grid grid-cols-3 h-screen"
        style={{ gridTemplateRows: "5em 1fr" }}
      >
        <Header />
        <Sidebar onClick={setCurrentItem} />
        <Main currentItem={currentItem} />
      </div>
    </NavigationProvider>
  );
};

export default App;
