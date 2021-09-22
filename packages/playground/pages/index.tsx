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
  const [config, setConfig] = useState({ area: false, animated: false, strictArea: false });
  const controls = useAnimation();

  const { node } = useNavigationContext();

  useEffect(() => {
    if (node) {
      let timer: any;
      const position = node?.getBoundingClientRect();

      const borderRadius = window.getComputedStyle(node).borderRadius;

      void controls
        .start({
          y: position.top,
          x: position.left,
          width: position.width,
          height: position.height,
          borderRadius: borderRadius === "0px" ? "4px" : borderRadius,
          backgroundColor: "rgba(123, 97, 255, .05)",
          borderColor: "rgba(123, 97, 255, 1)",
          transition: { type: "spring", duration: 0.4, delay: 0.1 },
        })
        .then(() => {
          timer = setTimeout(() => {
            void controls.start({
              backgroundColor: "rgba(123, 97, 255, 0)",
              borderColor: "rgba(123, 97, 255, 0.5)",
              transition: { duration: 0.3 },
            });
          }, 500);
        });

      return () => {
        clearInterval(timer);
      };
    }
  }, [node]);

  return (
    <Provider areaClassName="area-selected" strictArea={config.strictArea}>
      <style>{`.area-selected,[data-focus-visible-added] {
    outline: 2px solid #7B61FF;
    ${config.animated ? "outline: none;" : ""}
    }
    ${config.animated ? `*:focus {
    outline: none;
    }` : ""}
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
              border: "1px solid",
              pointerEvents: "none",
              willChange: 'left, top'
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
