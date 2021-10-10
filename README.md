# Spatial keyboard navigation

> The following project is an experiment and it's still under exploration.

### Motivation

The current way to navigate through selectable elements in a page hasn't changed much, and we are used to considering it the right way to navigate in a DOM document, but I'd like to bring a fresh perspective on this approach.

Human beings generally use visualization methods to memorize and understand the space they are surrounded by. Still, for some reason, the browsers don't use these methods in favor of user experience. The TAB key has been great for a long time and it solves many problems, so **what's wrong with using it to navigate in a DOM document?**

- It follows the order of the DOM elements and not the visual position of these elements in the page, which means that it uses the HTML structure (not user-friendly), but it should go after the layout position (spatial position);
- There is no easy way to jump long distances in the interface: TAB key navigation obligates you to go through all elements between your starting point and target point;
- It's hard to memorize the path to select an element on the page because the DOM document doesn't follow a human-friendly order.

### Spatial sensitive keyboard navigation

Graphical User Interface has already been using analogies from the real world on the computer universe (e.g., floppy disk for saving files). Bringing a spatial navigation approach might also improve the navigation in a DOM document.

That said, putting all selectable elements in a visual hierarchy structure and using the arrow keys to navigate through them might be the easiest way to introduce this new concept, which works just like a spreadsheet.

`Video`

This approach makes it easier and faster to navigate through the selectable elements, plus it doesn't introduce any new aspects and it doesn't require any new learnings from the users.

**The memory journey**

However, to make navigation even faster and make it even easier to memorize the "paths" the users take on the page, we need to picture that these selectable items belong to a group of items, or that there are "paths" to get to them. These issues lead to the following concepts:

- Areas: in the real world, you'd expect to see a refrigerator in a kitchen. Just like in the kitchen, Areas gather the things that belong to the same place, putting them together in a big selectable element;
- Paths: storing and reproducing the finding the shortest path from one point to another, which is often unnoticed by us, is essential to make navigation snappier and more natural.

### Usage

To get started, install the package and wrap the whole application using the following Provider component:

```jsx
import { Provider } from "spatial-keyboard-navigation";

const App = ({ children }) => <Provider>{children}</Provider>;
```

| Prop name       | Description                                                    | Type      | Default value   |
| --------------- | -------------------------------------------------------------- | --------- | --------------- |
| `areaClassName` | ClassName when the area is selected                            | `string`  | `area-selected` |
| `strictArea`    | It doesn't allow the user navigate beyond the area boundaries. | `boolean` | `false`         |

### Components

Spatial navigation introduces two main components to make the items selectable: `Anchor` and `Area`

```jsx
import { Area, Anchor } from "spatial-keyboard-navigation";

const Sidebar = () => {
  return (
    <Area>
      <section>
        <Anchor>
          <a href="">Item</a>
        </Anchor>
        <Anchor>
          <a href="">Item</a>
        </Anchor>
        <Anchor>
          <button>Item</button>
        </Anchor>
      </section>
    </Area>
  );
};
```

**Reference**

[Zeh Fernandes](https://twitter.com/zehf)
[https://en.wikipedia.org/wiki/Method_of_loci](https://en.wikipedia.org/wiki/Method_of_loci)
