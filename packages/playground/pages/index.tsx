import { NavigationAnchor, NavigationProvider } from "spatial-focus-react";
import { useState } from "react";
import "show-keys";

const App: React.FC = () => {
  const [toggle, setToggle] = useState(false);
  return (
    <NavigationProvider>
      <style>{`*:focus {
    outline: 2px solid #d71ef7;
}
 `}</style>
      <NavigationAnchor>
        <button onClick={() => setToggle(!toggle)}>Toggle</button>
      </NavigationAnchor>
      <table>
        <tbody>
          <tr>
            <td></td>
            <td>
              <NavigationAnchor>
                <a href="">test 2</a>
              </NavigationAnchor>
            </td>
            <td>
              <NavigationAnchor>
                <a href="">test 3</a>
              </NavigationAnchor>
            </td>
          </tr>
          <tr>
            <td>
              <NavigationAnchor>
                <a href="">test 11111</a>
              </NavigationAnchor>
            </td>
            <td></td>
            <td>
              <NavigationAnchor>
                <a href="">test 2</a>
              </NavigationAnchor>
            </td>
          </tr>
          {toggle && (
            <tr>
              <td>
                <NavigationAnchor>
                  <a href="">test new</a>
                </NavigationAnchor>
              </td>
              <td>
                <NavigationAnchor>
                  <a href="">test new</a>
                </NavigationAnchor>
              </td>
              <td>
                <NavigationAnchor>
                  <a href="">test new</a>
                </NavigationAnchor>
              </td>
            </tr>
          )}
          <tr>
            <td>
              <NavigationAnchor>
                <a href="">test 4</a>
              </NavigationAnchor>
            </td>

            <td>
              <NavigationAnchor>
                <button disabled>test 5</button>
              </NavigationAnchor>
            </td>
            <td>
              <NavigationAnchor>
                <a href="">test 6</a>
              </NavigationAnchor>
            </td>
          </tr>
        </tbody>
      </table>
    </NavigationProvider>
  );
};

export default App;
