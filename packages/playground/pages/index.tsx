import { NavigationAnchor, NavigationProvider } from "navigation-react";
import { useState } from "react";

const App: React.FC = () => {
  const [toggle, setToggle] = useState(false);
  return (
    <NavigationProvider>
      <style>{`.select {color:red}`}</style>
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
                <a href="">test 5</a>
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
