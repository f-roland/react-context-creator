# ReactContext

This module enables to quickly and simply enable access to a React context, using the new React API.
If you are using a version of React that doesn't have the `createContext` function, this module will fallback on a polyfill.

# How to Create a context

the module has a single named function export called `createContext`. You call it with 2 properties :

- an initial context object with the keys of the properties and their initial values
- a `stateValidator` predicate which can be used to validate a context change agains some values. it is invoked with `stateValidator({ property, value })` where property is the name of the property that is being modified, and the new value.

The `createContext` function will automatically create setters functions for all the properties you declare in the initial context. For instance, if your initial context is `{ foo: "someVal", barBaz: "someOtherVal" }`, the function will automatically create `setFoo` and `setBarBaz` functions to manipulate these values in the context.

The function returns an object with components & decorators to consume & provide the context. from the jsdoc :

```javascript
/**
 * @typedef Context
 * @property {Object} Context.Provider react class component to use as context provider
 * @property {Function} Context.Consumer react functional component to use as context consumer
 * @property {Function} Context.withProvider HOC to apply the context provider
 * @property {function} Context.withConsumer HOC to apply the context consumer. passes the context as props
 * to the wrapped component
 */

/**
 * Creates a React Context and returns consumer & providers components & decorators to interact
 * with this context.
 * @param {Object} initialContext map of context properties and their initial values
 * @param {Function} stateValidator optional predicate to tell whether the state update is valid or not
 * @returns {Context} Object containing the context components & decorators {@link Context}
 */
```

# Usage

```javascript

import { createContext } from "react-context-creator";

const initialContext = { appState: "Loading" };
const stateValidator = ({ property, value }) => property === "appState" && ["laoding", "in_background", "launched"].includes(value);
// stateValidator is optional, but it's convenient to avoid bugs when consumers try to update either an incorrect property or an incorrect value

const AppStateContext = createContext(initialContext, stateValidator);

const MyReactApp = props => (
  <View>
    <AppStateContext.Consumer>
      { ({appState}) => <View><Text>AppState is {appState}</Text><View> }
    </AppStateContext.Consumer>
    /* ... */
    <AppStateContext.Consumer>
      { ({setAppState}) => <Button label="App Finished Loading" onPress={() => setAppState("launched")} />}
    </AppStateContext.Consumer>
  </View>
)

// don't forget the Provider !
const DecoratedApp = AppStateContext.withProvider(MyReactApp);

export default DecoratedApp;

```

Or with the classic Counter example

```javascript
import { createContext } from "react-context-creator";

const initialContext = { counter: 0 };
const stateValidator = ({ property, value }) =>
  property === "counter" && typeof value === "number" && !Number.isNaN(value);

const CounterContext = createContext(initialContext, stateValidator);

// Using the decorator or the component with a render function is almost equivalent
// Just beware of props override if using the decorator. If you have a prop with a name that is also in the context,
// the value from the context will override the prop
const Header = CounterContext.withConsumer(({ counter }) => (
  <View>
    <Text>Counter: {counter}</Text>
  </View>
));

const CounterApp = () => {
  <View>
    <Header />
    <CounterContext.Consumer>
      {({ counter, setCounter }) => (
        <View>
          <Button label="increment" onPress={() => setCounter(counter + 1)} />
          <Button label="decrement" onPress={() => setCounter(counter - 1)} />
          <Button label="reset" onPress={() => setCounter(0)} />
        </View>
      )}
    </CounterContext.Consumer>
  </View>;
};

// We could also have wrapped `CounterApp` with <CounterContext.Provider>
export const DecoratedCounterApp = CounterContext.withProvider(CounterApp);
```

This pattern is very powerful as the different consumers (whether to get the value or to set it) can be in completely different locations in the code base.
This avoids having to resort to Redux and it's consequent boilerplate code to easily pass values & their setters up & down the tree in a react app. It also helps to keep things in isolation properly

# How to provide the context

the module offers 2 ways of providing the context

1. **with a component**

```javascript
import { AppStateContext } from "../AppStateContext";

const MyComponent = props => (
  <AppStateContext.Provider>
    <View>/* anything... */</View>
  </AppStateContext.Provider>
);

export default MyComponent;
```

2. **with a decorator**

```javascript
import { AppStateContext } from "../AppStateContext";

const MyComponent = AppStateContext.withProvider(props => (
  <View>/* anything... */</View>
));

export default MyComponent;
```

# How to consume a context

Similarly, leveraging the context can be done in 2 ways :

1. **with the consumer component**

```javascript
import { AppStateContext } from "../AppStateContext";

export function MyComponentWithContext(props) {
  return (
    <View>
      <Text> Header </Text>
      <AppStateContext.Consumer>
        {({ appState, setAppState }) => {
          return (
            <View>
              <Text>App is in {appState}</Text>
              <View>
                <Button
                  label="set app to launched"
                  onPress={() => setAppState("launched")}
                />
              </View>
            </View>
          );
        }}
      </AppStateContext.Consumer>
    </View>
  );
}
```

2. **with the decorator**

```javascript
import { AppStateContext } from "../AppStateContext";

function MyComponent({ appState, setAppState, ...otherProps }) {
  return (
    <View>
      <Text> Header </Text>
      <View>
        <Text>App is in {appState}</Text>
        <View>
          <Button
            label="set app to launched"
            onPress={() => setAppState("launched")}
          />
        </View>
      </View>
    </View>
  );
}

export const MyDecoratedComponent = withDisplayStateConsumer(MyComponent);
```
