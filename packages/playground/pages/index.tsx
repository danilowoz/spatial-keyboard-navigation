import { Provider } from "spatial-focus-react";

import "show-keys";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Main from "../components/Main";
import Options from "../components/Options";
import { useState } from "react";

const App: React.FC = () => {
  const [currentItem, setCurrentItem] = useState(8);

  return (
    <Provider>
      <style>{`.area-selected,[data-focus-visible-added] {
    outline: 2px solid #7B61FF;
}
 `}</style>
      <div
        className="grid grid-cols-4 h-screen"
        style={{ gridTemplateRows: "5em 1fr" }}
      >
        <Header />
        <Sidebar onClick={setCurrentItem} />
        <Main currentItem={currentItem} />
        <Options />
      </div>
    </Provider>
  );
};

export default App;
