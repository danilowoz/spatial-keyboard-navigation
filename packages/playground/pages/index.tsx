import { NavigationAnchor } from "navigation-react";

const App: React.FC = () => {
  return (
    <table>
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
    </table>
  );
};

export default App;
