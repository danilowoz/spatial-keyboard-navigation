import { NavigationAnchor } from "navigation-react";
import { useState } from "react";

const App: React.FC = () => {
  const [toggle, setToggle] = useState(false);
  return (
    <>
      <button onClick={() => setToggle(!toggle)}>Toggle</button>
      <table>
        <tbody>
          <tr>
            <td>
              <NavigationAnchor>
                <a href="">test 1</a>
              </NavigationAnchor>
            </td>
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
                <a href="">test 4</a>
              </NavigationAnchor>
            </td>

            <td>
              <NavigationAnchor>
                <a href="">test 5</a>
              </NavigationAnchor>
            </td>
            <td>
              <NavigationAnchor>
                <a href="">test 6</a>
              </NavigationAnchor>
            </td>
          </tr>
          {toggle && (
            <tr>
              <td>
                <NavigationAnchor>
                  <a href="">test odd</a>
                </NavigationAnchor>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default App;
