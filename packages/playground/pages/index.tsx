import { Provider, useNavigationContext } from "spatial-focus-react";
import { motion, useAnimation } from "framer-motion";

import "show-keys";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Main from "../components/Main";
import Options from "../components/Options";
import { useEffect, useState } from "react";

const App: React.FC = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [config, setConfig] = useState({ area: false, animated: false });
  const controls = useAnimation();

  const { node } = useNavigationContext();

  useEffect(() => {
    if (node) {
      let timer: any;
      const position = node?.getBoundingClientRect();

      void controls
        .start({
          y: position.top,
          x: position.left,
          width: position.width,
          height: position.height,
          borderRadius: window.getComputedStyle(node).borderRadius,
          backgroundColor: "rgba(123, 97, 255, .1)",
        })
        .then(() => {
          timer = setTimeout(() => {
            void controls.start({
              backgroundColor: "rgba(123, 97, 255, 0)",
            });
          }, 1500);
        });

      return () => {
        clearInterval(timer);
      };
    }
  }, [node]);

  return (
    <Provider>
      <style>{`.area-selected,[data-focus-visible-added] {
    outline: 2px solid #7B61FF;
    ${config.animated ? "outline: none;" : ""}
}
 `}</style>
      <div
        className="grid grid-cols-4 h-screen"
        style={{ gridTemplateRows: "5em 1fr" }}
      >
        {config.animated && (
          <motion.div
            className="fixed"
            animate={controls}
            style={{
              pointerEvents: "none",
            }}
          />
        )}
        <Header area={config.area} />
        <Sidebar
          setConfig={setConfig}
          config={config}
          onClick={setCurrentItem}
        />
        <Main area={config.area} currentItem={currentItem} />
        <Options area={config.area} />
      </div>
    </Provider>
  );
};

export default App;
